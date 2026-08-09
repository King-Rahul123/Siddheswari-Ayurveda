import os
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient

app = FastAPI(title="Siddheswari Ayurveda Analytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/")
DB_NAME = os.getenv("DB_NAME", "siddheswari_ayurveda")

def get_db():
    client = MongoClient(MONGO_URI)
    return client[DB_NAME]

def parse_dt(val):
    if not val:
        return None
    if isinstance(val, datetime):
        return val
    s = str(val).strip()
    if not s:
        return None
    
    # Clean up standard ISO suffixes for strptime parsing
    clean_s = s.replace("Z", "")
    if "." in clean_s:
        clean_s = clean_s.split(".")[0]
        
    for fmt in (
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d",
        "%d/%m/%Y",
        "%d-%m-%Y",
        "%Y/%m/%d",
    ):
        try:
            return datetime.strptime(clean_s[:19] if "T" in clean_s else clean_s[:10], fmt)
        except Exception:
            pass
    return None

def get_doc_date(doc):
    dt = parse_dt(doc.get("createdAt"))
    if not dt:
        dt = parse_dt(doc.get("date"))
    if not dt:
        dt = parse_dt(doc.get("invoiceDate"))
    if not dt:
        dt = parse_dt(doc.get("appointmentDate"))
    return dt

@app.get("/")
def read_root():
    return {"message": "Siddheswari Ayurveda Python FastAPI Analytics Service Running"}

@app.get("/api/analytics/overview")
def get_analytics_overview():
    db = get_db()
    
    sales_collection = db["sales"]
    purchases_collection = db["purchases"]
    customers_collection = db["customers"]
    products_collection = db["products"]
    stock_collection = db["stock"]
    patients_collection = db["patients"]
    
    sales = list(sales_collection.find())
    purchases = list(purchases_collection.find())
    stock_items = list(stock_collection.find())
    products = list(products_collection.find())
    customers_count = customers_collection.count_documents({})
    appointments_count = patients_collection.count_documents({})
    
    revenue = 0.0
    total_purchase = 0.0
    net_purchase = 0.0
    today_sales = 0.0
    today_dt = datetime.now().date()
    
    monthly_sales = {}
    monthly_purchases = {}
    payment_methods = {}
    product_sales_qty = {}
    
    # Process Purchases
    for p in purchases:
        grand_amt = float(p.get("grandTotal", p.get("totalAmount", p.get("total", 0.0))) or 0.0)
        net_amt = float(p.get("netAmount", p.get("totalAmount", p.get("grandTotal", p.get("total", 0.0)))) or 0.0)
        
        total_purchase += grand_amt
        net_purchase += net_amt
        
        p_date = get_doc_date(p)
        if p_date:
            month_key = p_date.strftime("%b")
            monthly_purchases[month_key] = monthly_purchases.get(month_key, 0.0) + grand_amt

    # Process Sales
    for sale in sales:
        amount = float(sale.get("grandTotal", sale.get("netAmount", sale.get("totalAmount", sale.get("total", 0.0)))) or 0.0)
        revenue += amount
        
        sale_date = get_doc_date(sale)
        if sale_date:
            if sale_date.date() == today_dt:
                today_sales += amount
                
            month_key = sale_date.strftime("%b")
            monthly_sales[month_key] = monthly_sales.get(month_key, 0.0) + amount
        
        pm = sale.get("paymentMethod", "Cash") or "Cash"
        payment_methods[pm] = payment_methods.get(pm, 0.0) + amount
        
        items = sale.get("items", [])
        if isinstance(items, list):
            for item in items:
                name = item.get("productName", item.get("name", "Unknown"))
                qty = float(item.get("qty", item.get("quantity", 0)) or 0)
                product_sales_qty[name] = product_sales_qty.get(name, 0) + qty

    # Calculate Stock Metrics & Total Inventory Valuation
    stock_amount = 0.0
    if stock_items:
        for s in stock_items:
            s_qty = float(s.get("qty", 0) or 0)
            s_rate = float(s.get("rate", s.get("mrp", 0)) or 0)
            stock_amount += max(0.0, s_qty * s_rate)
    
    low_stock_count = 0
    out_of_stock_count = 0
    in_stock_count = 0
    low_stock_list = []
    
    prod_stock_valuation = 0.0
    for p in products:
        stock_val = float(p.get("stock", 0) or 0)
        min_stock = float(p.get("minStock", 10) or 10)
        name = p.get("productName", p.get("name", "Unnamed Product"))
        
        mrp_val = p.get("mrp", 0)
        unit_price = 0.0
        if isinstance(mrp_val, list) and mrp_val:
            unit_price = float(mrp_val[0] or 0)
        elif mrp_val is not None:
            unit_price = float(mrp_val or 0)
        prod_stock_valuation += max(0.0, stock_val * unit_price)
        
        if stock_val <= 0:
            out_of_stock_count += 1
            low_stock_list.append({"productName": name, "name": name, "stock": int(stock_val)})
        elif stock_val <= min_stock:
            low_stock_count += 1
            low_stock_list.append({"productName": name, "name": name, "stock": int(stock_val)})
        else:
            in_stock_count += 1
            
    if stock_amount == 0.0:
        stock_amount = prod_stock_valuation
        
    low_stock_list.sort(key=lambda x: x["stock"])
    
    # Calculate Performance % (Sales to Purchase recovery ratio)
    performance = 0.0
    if net_purchase > 0:
        performance = round((revenue / net_purchase) * 100, 1)
    elif revenue > 0:
        performance = 100.0
    
    month_order = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    sales_data = [
        {
            "month": m,
            "sales": round(monthly_sales.get(m, 0.0), 2),
            "purchases": round(monthly_purchases.get(m, 0.0), 2)
        }
        for m in month_order
        if m in monthly_sales or m in monthly_purchases
    ]
    
    payment_data = [{"name": k, "value": round(v, 2)} for k, v in payment_methods.items()]
    
    top_products = [
        {"name": k, "qty": int(v)}
        for k, v in sorted(product_sales_qty.items(), key=lambda item: item[1], reverse=True)[:5]
    ]
    
    recent_sales = list(sales_collection.find().sort("createdAt", -1).limit(5))
    activities = []
    for s in recent_sales:
        s_date = get_doc_date(s)
        date_fmt = s_date.strftime("%d/%m/%Y") if s_date else str(s.get("date", "-"))
            
        activities.append({
            "invoiceNo": s.get("saleId", s.get("invoiceNo", "Sale")),
            "grandTotal": float(s.get("grandTotal", s.get("total", 0.0)) or 0.0),
            "total": float(s.get("grandTotal", s.get("total", 0.0)) or 0.0),
            "dateFormatted": date_fmt
        })
        
    return {
        "stats": {
            "netPurchase": round(net_purchase, 2),
            "totalPurchase": round(total_purchase, 2),
            "revenue": round(revenue, 2),
            "todaySales": round(today_sales, 2),
            "customers": customers_count,
            "products": len(products),
            "appointments": appointments_count,
            "stockAmount": round(stock_amount, 2),
            "performance": performance,
            "lowStock": low_stock_count,
            "inStock": in_stock_count,
            "outOfStock": out_of_stock_count
        },
        "salesData": sales_data,
        "paymentData": payment_data,
        "topProducts": top_products,
        "lowStockProducts": low_stock_list,
        "activities": activities
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

