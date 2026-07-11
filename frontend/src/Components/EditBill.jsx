import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";
import "../CSS/SaleInvoice.css";

export default function EditSale() {
    const navigate = useNavigate();
    const { billNumber } = useParams();
    const [customerName, setCustomerName] = useState("");
    const [mobile, setMobile] = useState("");
    const [items, setItems] = useState([]);

    useEffect(() => {
        const bills =
            JSON.parse(localStorage.getItem("salesBills")) || [];
        const bill = bills.find(
            (b) => b.billNumber === billNumber
        );

        if (bill) {
            setCustomerName(bill.customerName);
            setMobile(bill.mobile);
            setItems(bill.items);
        }
    }, [billNumber]);

    const updateItem = (index, field, value) => {
        const updated = [...items];
        updated[index][field] = value;
        setItems(updated);
    };

    const addRow = () => {
        setItems([
            ...items,
            {
                productName: "",
                qty: 1,
                rate: 0,
                amount: 0,
            },
        ]);

    };

    const deleteRow = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleUpdate = () => {
        const bills =
            JSON.parse(localStorage.getItem("salesBills")) || [];
        const index = bills.findIndex(
            (b) => b.billNumber === billNumber
        );

        if (index !== -1) {
            bills[index] = {
                ...bills[index],
                customerName,
                mobile,
                items,
            };
            localStorage.setItem(
                "salesBills",
                JSON.stringify(bills)
            );
            alert("Bill Updated Successfully");
            navigate("/dashboard/sales");
        }
    };

    return (
        <div className="dashboard">
            <Sidebar />
            <div className="dashboard-wrapper">
                <Header />
                <main className="dashboard-content">
                    <h2>Edit Sale Invoice</h2>
                    <div className="invoice-top">
                        <div>
                            <label>Bill Number</label>
                            <input value={billNumber} readOnly />
                        </div>
                        <div>
                            <label>Customer Name</label>
                            <input value={customerName} onChange={(e) => setCustomerName(e.target.value) }/>
                        </div>
                        <div>
                            <label>Mobile</label>
                            <input value={mobile} onChange={(e) => setMobile(e.target.value)}/>
                        </div>
                    </div>
                    <table className="sale-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Qty</th>
                                <th>Rate</th>
                                <th>Amount</th>
                                <th></th>
                            </tr>
                        </thead>

                        <tbody>
                            {items.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <input
                                            value={item.productName}
                                            onChange={(e) =>
                                                updateItem(
                                                    index,
                                                    "productName",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            value={item.qty}
                                            onChange={(e) =>
                                                updateItem(
                                                    index,
                                                    "qty",
                                                    Number(e.target.value)
                                                )
                                            }
                                        />
                                    </td>

                                    <td>
                                        <input
                                            type="number"
                                            value={item.rate}
                                            onChange={(e) =>
                                                updateItem(
                                                    index,
                                                    "rate",
                                                    Number(e.target.value)
                                                )
                                            }
                                        />
                                    </td>

                                    <td>₹{item.qty * item.rate}</td>
                                    <td><button onClick={() => deleteRow(index)}><i className="bi bi-trash text-red-500"></i></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <br />
                    <button onClick={addRow}>Add Product</button>
                    <button className="save-btn" onClick={handleUpdate} style={{ marginLeft: "10px" }}>Update Bill</button>
                </main>
            </div>
        </div>
    );
}