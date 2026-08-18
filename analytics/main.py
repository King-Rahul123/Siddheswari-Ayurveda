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
def get_analytics_overview(timeframe: str = "monthly"):
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
    
    gross_sale = 0.0
    pur_rate = 0.0
    revenue = 0.0
    total_purchase = 0.0
    net_purchase = 0.0
    today_sales = 0.0
    today_dt = datetime.now().date()
    
    monthly_sales = {}
    monthly_purchases = {}
    monthly_profit = {}
    weekly_sales = {}
    weekly_purchases = {}
    weekly_profit = {}
    yearly_sales = {}
    yearly_purchases = {}
    yearly_profit = {}
    payment_methods = {}
    product_sales_qty = {}
    
    # Process Sales (MRP basis & Gross Sale as per Sale.jsx)
    for sale in sales:
        sale_gross = float(sale.get("netAmount", sale.get("grandTotal", sale.get("totalAmount", sale.get("total", 0.0)))) or 0.0)
        gross_sale += sale_gross

        doc_amount = float(sale.get("grandTotal", sale.get("netAmount", sale.get("totalAmount", sale.get("total", 0.0)))) or 0.0)
        
        # Calculate MRP-based sale total = Σ(MRP × Quantity) and pur_rate = Σ(rate × Quantity)
        sale_mrp_total = 0.0
        sale_pur_rate = 0.0
        s_items = sale.get("items", [])
        if isinstance(s_items, list) and len(s_items) > 0:
            for item in s_items:
                mrp_val = item.get("mrp", item.get("rate", item.get("price", 0.0)))
                if isinstance(mrp_val, (list, tuple)):
                    mrp_val = mrp_val[-1] if mrp_val else 0.0
                mrp_num = float(mrp_val or 0.0)

                rate_val = item.get("rate", item.get("purchaseRate", 0.0))
                if isinstance(rate_val, (list, tuple)):
                    rate_val = rate_val[-1] if rate_val else 0.0
                rate_num = float(rate_val or 0.0)

                qty_num = float(item.get("qty", item.get("quantity", 0.0)) or 0.0)
                sale_mrp_total += mrp_num * qty_num
                sale_pur_rate += rate_num * qty_num

        pur_rate += sale_pur_rate

        if sale_mrp_total <= 0 and doc_amount > 0:
            sale_mrp_total = doc_amount

        revenue += sale_mrp_total
        sale_profit = sale_gross - sale_pur_rate
        
        sale_date = get_doc_date(sale)
        if sale_date:
            if sale_date.date() == today_dt:
                today_sales += sale_mrp_total
                
            month_key = sale_date.strftime("%b")
            monthly_sales[month_key] = monthly_sales.get(month_key, 0.0) + sale_mrp_total
            monthly_profit[month_key] = monthly_profit.get(month_key, 0.0) + sale_profit

            iso_year, iso_week, _ = sale_date.isocalendar()
            week_key = f"Week {iso_week}"
            weekly_sales[week_key] = weekly_sales.get(week_key, 0.0) + sale_mrp_total
            weekly_profit[week_key] = weekly_profit.get(week_key, 0.0) + sale_profit

            year_key = str(sale_date.year)
            yearly_sales[year_key] = yearly_sales.get(year_key, 0.0) + sale_mrp_total
            yearly_profit[year_key] = yearly_profit.get(year_key, 0.0) + sale_profit
        
        pm = sale.get("paymentMethod", "Cash") or "Cash"
        payment_methods[pm] = payment_methods.get(pm, 0.0) + sale_mrp_total
        
        items = sale.get("items", [])
        if isinstance(items, list):
            for item in items:
                name = item.get("productName", item.get("name", "Unknown"))
                qty = float(item.get("qty", item.get("quantity", 0)) or 0)
                product_sales_qty[name] = product_sales_qty.get(name, 0) + qty

    # Calculate Stock Metrics & Total Inventory Valuation in MRP
    stock_amount = 0.0
    if stock_items:
        for s in stock_items:
            s_qty = float(s.get("qty", s.get("stock", 0)) or 0)
            mrp_val = s.get("mrp", s.get("rate", 0))
            if isinstance(mrp_val, (list, tuple)):
                mrp_val = mrp_val[-1] if mrp_val else 0.0
            s_mrp = float(mrp_val or 0.0)
            stock_amount += max(0.0, s_qty * s_mrp)
    
    low_stock_count = 0
    out_of_stock_count = 0
    in_stock_count = 0
    low_stock_list = []
    
    # Pre-index purchase and sale item quantities by MRP per product
    pur_mrp_qty_map = {}
    for pur in purchases:
        for item in pur.get("items", []):
            i_name = (item.get("productName") or item.get("name") or "").strip().lower()
            if not i_name:
                continue
            i_mrp = float(item.get("mrp", item.get("rate", 0.0)) or 0.0)
            i_qty = float(item.get("qty", 0) or 0) + float(item.get("free", 0) or 0)
            if i_name not in pur_mrp_qty_map:
                pur_mrp_qty_map[i_name] = {}
            pur_mrp_qty_map[i_name][i_mrp] = pur_mrp_qty_map[i_name].get(i_mrp, 0.0) + i_qty

    sale_mrp_qty_map = {}
    for s_doc in sales:
        for item in s_doc.get("items", []):
            i_name = (item.get("productName") or item.get("name") or "").strip().lower()
            if not i_name:
                continue
            i_mrp = float(item.get("mrp", item.get("rate", 0.0)) or 0.0)
            i_qty = float(item.get("qty", item.get("quantity", 0.0)) or 0.0)
            if i_name not in sale_mrp_qty_map:
                sale_mrp_qty_map[i_name] = {}
            sale_mrp_qty_map[i_name][i_mrp] = sale_mrp_qty_map[i_name].get(i_mrp, 0.0) + i_qty

    prod_stock_valuation = 0.0
    closing_stock = 0.0

    # Pre-index purchase and sale item quantities by RATE per product for closing stock
    pur_rate_qty_map = {}
    for pur in purchases:
        for item in pur.get("items", []):
            i_name = (item.get("productName") or item.get("name") or "").strip().lower()
            if not i_name:
                continue
            i_rate = float(item.get("rate", item.get("purchaseRate", 0.0)) or 0.0)
            i_qty = float(item.get("qty", 0) or 0) + float(item.get("free", 0) or 0)
            if i_name not in pur_rate_qty_map:
                pur_rate_qty_map[i_name] = {}
            pur_rate_qty_map[i_name][i_rate] = pur_rate_qty_map[i_name].get(i_rate, 0.0) + i_qty

    sale_rate_qty_map = {}
    for s_doc in sales:
        for item in s_doc.get("items", []):
            i_name = (item.get("productName") or item.get("name") or "").strip().lower()
            if not i_name:
                continue
            i_rate = float(item.get("rate", item.get("purchaseRate", 0.0)) or 0.0)
            i_qty = float(item.get("qty", item.get("quantity", 0.0)) or 0.0)
            if i_name not in sale_rate_qty_map:
                sale_rate_qty_map[i_name] = {}
            sale_rate_qty_map[i_name][i_rate] = sale_rate_qty_map[i_name].get(i_rate, 0.0) + i_qty

    for p in products:
        stock_val = float(p.get("stock", 0) or 0)
        min_stock = float(p.get("minStock", 10) or 10)
        name = p.get("productName", p.get("name", "Unnamed Product"))
        name_key = name.strip().lower()
        
        # 1. Stock Amount (MRP basis)
        mrp_val = p.get("mrp", 0)
        unit_val = 0.0
        if isinstance(mrp_val, (list, tuple)) and len(mrp_val) > 1:
            rem_stock = stock_val
            p_map = pur_mrp_qty_map.get(name_key, {})
            s_map = sale_mrp_qty_map.get(name_key, {})
            for m in mrp_val:
                m_float = float(m or 0.0)
                p_q = p_map.get(m_float, 0.0)
                s_q = s_map.get(m_float, 0.0)
                rem_q = max(0.0, p_q - s_q)
                act_q = min(rem_q, rem_stock)
                unit_val += act_q * m_float
                rem_stock -= act_q
                if rem_stock <= 0:
                    break
            if rem_stock > 0 and mrp_val:
                unit_val += rem_stock * float(mrp_val[-1] or 0.0)
        else:
            if isinstance(mrp_val, (list, tuple)):
                u_price = float(mrp_val[0] if mrp_val else 0.0)
            else:
                u_price = float(mrp_val or 0.0)
            unit_val = max(0.0, stock_val * u_price)

        prod_stock_valuation += unit_val

        # 2. Closing Stock (Rate basis = Σ(rate × qty))
        rate_val = p.get("rate", p.get("purchaseRate", 0.0))
        unit_rate_val = 0.0
        if isinstance(rate_val, (list, tuple)) and len(rate_val) > 1:
            rem_stock_r = stock_val
            pr_map = pur_rate_qty_map.get(name_key, {})
            sr_map = sale_rate_qty_map.get(name_key, {})
            for r in rate_val:
                r_float = float(r or 0.0)
                p_q = pr_map.get(r_float, 0.0)
                s_q = sr_map.get(r_float, 0.0)
                rem_q = max(0.0, p_q - s_q)
                act_q = min(rem_q, rem_stock_r)
                unit_rate_val += act_q * r_float
                rem_stock_r -= act_q
                if rem_stock_r <= 0:
                    break
            if rem_stock_r > 0 and rate_val:
                unit_rate_val += rem_stock_r * float(rate_val[-1] or 0.0)
        else:
            if isinstance(rate_val, (list, tuple)):
                u_rate = float(rate_val[0] if rate_val else 0.0)
            else:
                u_rate = float(rate_val or 0.0)
            unit_rate_val = max(0.0, stock_val * u_rate)

        closing_stock += unit_rate_val
        
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

    # Process Purchases (MRP basis including free items so Total Purchase = Total Sale + Stock Amount)
    for p in purchases:
        net_amt = float(p.get("netAmount", p.get("totalAmount", p.get("grandTotal", p.get("total", 0.0)))) or 0.0)
        net_purchase += net_amt

        p_items = p.get("items", [])
        p_mrp = 0.0
        if isinstance(p_items, list) and len(p_items) > 0:
            for item in p_items:
                mrp_val = item.get("mrp", item.get("rate", 0.0))
                if isinstance(mrp_val, (list, tuple)):
                    mrp_val = mrp_val[-1] if mrp_val else 0.0
                mrp_num = float(mrp_val or 0.0)
                qty_num = float(item.get("qty", item.get("quantity", 0.0)) or 0.0) + float(item.get("free", 0.0) or 0.0)
                p_mrp += mrp_num * qty_num
        if p_mrp <= 0:
            p_mrp = float(p.get("grandTotal", p.get("totalAmount", 0.0)) or 0.0)

        p_date = get_doc_date(p)
        if p_date:
            month_key = p_date.strftime("%b")
            monthly_purchases[month_key] = monthly_purchases.get(month_key, 0.0) + p_mrp

            iso_year, iso_week, _ = p_date.isocalendar()
            week_key = f"Week {iso_week}"
            weekly_purchases[week_key] = weekly_purchases.get(week_key, 0.0) + p_mrp

            year_key = str(p_date.year)
            yearly_purchases[year_key] = yearly_purchases.get(year_key, 0.0) + p_mrp

    # Total Purchase in MRP is mathematically set to Total Sale (revenue) + Stock Amount
    total_purchase = revenue + stock_amount
        
    low_stock_list.sort(key=lambda x: x["stock"])
    
    # Calculate Profit and Performance %:
    # profit = gross_sale - pur_rate
    # performance = (profit / gross_sale) * 100
    profit = gross_sale - pur_rate
    performance = round((profit / gross_sale) * 100, 1) if gross_sale > 0 else 0.0
    
    month_order = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    monthly_sales_data = [
        {
            "label": m,
            "month": m,
            "sales": round(monthly_sales.get(m, 0.0), 2),
            "purchases": round(monthly_purchases.get(m, 0.0), 2),
            "profit": round(monthly_profit.get(m, 0.0), 2)
        }
        for m in month_order
        if m in monthly_sales or m in monthly_purchases
    ]

    all_week_keys = sorted(
        set(list(weekly_sales.keys()) + list(weekly_purchases.keys())),
        key=lambda k: int(k.replace("Week ", "")) if k.replace("Week ", "").isdigit() else 0
    )
    weekly_sales_data = [
        {
            "label": w,
            "week": w,
            "sales": round(weekly_sales.get(w, 0.0), 2),
            "purchases": round(weekly_purchases.get(w, 0.0), 2),
            "profit": round(weekly_profit.get(w, 0.0), 2)
        }
        for w in all_week_keys
    ]

    all_year_keys = sorted(
        set(list(yearly_sales.keys()) + list(yearly_purchases.keys())),
        key=lambda k: int(k) if k.isdigit() else 0
    )
    yearly_sales_data = [
        {
            "label": y,
            "year": y,
            "sales": round(yearly_sales.get(y, 0.0), 2),
            "purchases": round(yearly_purchases.get(y, 0.0), 2),
            "profit": round(yearly_profit.get(y, 0.0), 2)
        }
        for y in all_year_keys
    ]

    if timeframe == "weekly":
        active_sales_data = weekly_sales_data
    elif timeframe == "yearly":
        active_sales_data = yearly_sales_data
    else:
        active_sales_data = monthly_sales_data
    
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
            "grossSale": round(gross_sale, 2),
            "revenue": round(revenue, 2),
            "todaySales": round(today_sales, 2),
            "customers": customers_count,
            "products": len(products),
            "appointments": appointments_count,
            "stockAmount": round(stock_amount, 2),
            "closingStock": round(closing_stock, 2),
            "profit": round(profit, 2),
            "performance": performance,
            "lowStock": low_stock_count,
            "inStock": in_stock_count,
            "outOfStock": out_of_stock_count
        },
        "salesData": active_sales_data,
        "monthlySalesData": monthly_sales_data,
        "weeklySalesData": weekly_sales_data,
        "yearlySalesData": yearly_sales_data,
        "timeframe": timeframe,
        "paymentData": payment_data,
        "topProducts": top_products,
        "lowStockProducts": low_stock_list,
        "activities": activities
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

