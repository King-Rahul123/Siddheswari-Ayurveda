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

@app.get("/")
def read_root():
    return {"message": "Siddheswari Ayurveda Python FastAPI Analytics Service Running"}

@app.get("/api/analytics/overview")
def get_analytics_overview():
    db = get_db()
    
    sales_collection = db["sales"]
    customers_collection = db["customers"]
    products_collection = db["products"]
    
    sales = list(sales_collection.find())
    customers_count = customers_collection.count_documents({})
    products = list(products_collection.find())
    
    revenue = 0.0
    today_sales = 0.0
    today_str = datetime.now().strftime("%Y-%m-%d")
    today_date_str = datetime.now().strftime("%a %b %d %Y") # e.g. Thu Jul 23 2026
    
    monthly_sales = {}
    payment_methods = {}
    product_sales_qty = {}
    
    for sale in sales:
        amount = float(sale.get("grandTotal", sale.get("total", 0.0)) or 0.0)
        revenue += amount
        
        # Determine sale date
        sale_date = None
        if "createdAt" in sale and isinstance(sale["createdAt"], datetime):
            sale_date = sale["createdAt"]
        elif "date" in sale and sale["date"]:
            try:
                sale_date = datetime.strptime(str(sale["date"])[:10], "%Y-%m-%d")
            except Exception:
                sale_date = datetime.now()
        else:
            sale_date = datetime.now()
            
        if sale_date.strftime("%Y-%m-%d") == today_str:
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

    # Stock metrics
    low_stock_count = 0
    out_of_stock_count = 0
    in_stock_count = 0
    low_stock_list = []
    
    for p in products:
        stock_val = float(p.get("stock", 0) or 0)
        name = p.get("productName", p.get("name", "Unnamed Product"))
        
        if stock_val == 0:
            out_of_stock_count += 1
            low_stock_list.append({"productName": name, "name": name, "stock": stock_val})
        elif stock_val <= 10:
            low_stock_count += 1
            low_stock_list.append({"productName": name, "name": name, "stock": stock_val})
        else:
            in_stock_count += 1
            
    low_stock_list.sort(key=lambda x: x["stock"])
    
    month_order = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    sales_data = [{"month": m, "sales": monthly_sales[m]} for m in month_order if m in monthly_sales]
    
    payment_data = [{"name": k, "value": v} for k, v in payment_methods.items()]
    
    top_products = [
        {"name": k, "qty": v}
        for k, v in sorted(product_sales_qty.items(), key=lambda item: item[1], reverse=True)[:5]
    ]
    
    recent_sales = list(sales_collection.find().sort("createdAt", -1).limit(5))
    activities = []
    for s in recent_sales:
        created_at_val = s.get("createdAt")
        if isinstance(created_at_val, datetime):
            date_fmt = created_at_val.strftime("%d/%m/%Y")
        else:
            date_fmt = str(s.get("date", "-"))
            
        activities.append({
            "invoiceNo": s.get("saleId", s.get("invoiceNo", "Sale")),
            "grandTotal": float(s.get("grandTotal", s.get("total", 0.0)) or 0.0),
            "total": float(s.get("grandTotal", s.get("total", 0.0)) or 0.0),
            "dateFormatted": date_fmt
        })
        
    return {
        "stats": {
            "revenue": revenue,
            "todaySales": today_sales,
            "customers": customers_count,
            "products": len(products),
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
