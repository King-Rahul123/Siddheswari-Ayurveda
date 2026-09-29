import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";
import { getImageUrl } from "../api/config";
import { subscribeRemedies, updateRemedyDiscount } from "../services/remedyService";
import "../CSS/DShop.css";

const getProductId = (product) =>
    product._id || product.remedyId || product.id || product.productId;

const getPrice = (product) => {
    const value = product.price ?? product.mrp ?? 0;
    const numericValue = Number(String(value).replace(/[^\d.]/g, ""));
    return Number.isNaN(numericValue) ? 0 : numericValue;
};

const getDiscountedPrice = (product, discount = product.discount) =>
    getPrice(product) * (1 - Number(discount || 0) / 100);

const formatPrice = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function DShop() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [savingDiscountId, setSavingDiscountId] = useState(null);
    const [discountDrafts, setDiscountDrafts] = useState({});

    useEffect(() => {
        const unsubscribe = subscribeRemedies((data) => {
        if (Array.isArray(data)) {
            setProducts(data);
            setError("");
        } else {
            setProducts([]);
            setError("Unable to load shop products.");
        }
        setIsLoading(false);
        });

        return unsubscribe;
    }, []);

    const categories = useMemo(() => {
        const values = new Set();
        products.forEach((product) => {
            const productCategories = Array.isArray(product.category)
                ? product.category
                : [product.category];
            productCategories.filter(Boolean).forEach((category) => values.add(String(category).trim()));
        });
        return ["All", ...Array.from(values).sort()];
    }, [products]);

    const filteredProducts = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return products.filter((product) => {
            const productCategories = Array.isArray(product.category)
                ? product.category
                : [product.category];
            const matchesCategory =
                activeCategory === "All" || productCategories.some(
                (category) => String(category).toLowerCase() === activeCategory.toLowerCase()
                );
            const searchableText = [
                product.name,
                product.tag,
                product.description,
                ...productCategories,
                product.specifications?.benefits,
                product.specifications?.keyIngredients,
            ].filter(Boolean).join(" ").toLowerCase();

            return matchesCategory && searchableText.includes(query);
        });
    }, [activeCategory, products, searchQuery]);

    const handleDiscountChange = (productId, value) => {
            setDiscountDrafts((currentDrafts) => ({
            ...currentDrafts,
            [productId]: value,
        }));
    };

    const saveDiscount = async (product) => {
        const productId = getProductId(product);
        const draftValue = discountDrafts[productId] ?? product.discount ?? "";
        const discount = Number(draftValue);

        if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
            setError("Discount must be between 0 and 100.");
            return;
        }

        setSavingDiscountId(productId);
        try {
            await updateRemedyDiscount(productId, discount);
            setProducts((currentProducts) =>
                currentProducts.map((currentProduct) =>
                getProductId(currentProduct) === productId
                    ? { ...currentProduct, discount }
                    : currentProduct
                )
            );
            setDiscountDrafts((currentDrafts) => {
                const nextDrafts = { ...currentDrafts };
                delete nextDrafts[productId];
                return nextDrafts;
            });
            setError("");
        } catch (saveError) {
            setError(saveError.message || "Unable to save discount.");
        } finally {
            setSavingDiscountId(null);
        }
    };

    return (
        <div className="dashboard">
            <Sidebar />
            <div className="dashboard-wrapper">
                <Header />
                <main className="dashboard-content">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                        <div className="flex flex-col">
                            <h2 className="text-black ">Shop</h2>
                            <p className="text-muted mb-0">Manage the remedies displayed in your online store.</p>
                        </div>
                        <button className="btn btn-success" onClick={() => navigate("/shop")}>
                            <i className="bi bi-arrow-right me-2"></i>
                            Go to store
                        </button>
                    </div>

                    <section className="card">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <div>
                                <h3 className="mb-1">Store catalog</h3>
                                <p className="text-muted mb-0">{isLoading ? "Loading products..." : `${filteredProducts.length} products shown`}</p>
                            </div>

                            <div className="dshop-search position-relative">
                                <i className="bi bi-search dshop-search-icon"></i>
                                <input
                                    className="form-control ps-5"
                                    type="search"
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder="Search products"
                                    aria-label="Search products"
                                />
                            </div>
                        </div>

                        <div className="d-flex flex-wrap gap-2 mb-4" role="group" aria-label="Product categories">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    className={`btn ${activeCategory === category ? "btn-success" : "btn-outline-secondary"}`}
                                    onClick={() => setActiveCategory(category)}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        {error && <div className="alert alert-danger">{error}</div>}
                        {!isLoading && !error && filteredProducts.length === 0 && (
                            <div className="text-center text-muted py-5">
                                <i className="bi bi-search display-6 d-block mb-3"></i>
                                No products match the current filters.
                            </div>
                        )}

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {filteredProducts.map((product) => {
                                const productId = getProductId(product);
                                const discountValue = discountDrafts[productId] ?? product.discount ?? "";
                                const numericDiscount = Number(discountValue);
                                const previewDiscount = Number.isFinite(numericDiscount)
                                    ? Math.max(0, Math.min(100, numericDiscount))
                                    : 0;

                                return (
                                    <article key={productId} className="border rounded-3 overflow-hidden bg-white">
                                        <div>
                                            <div className="dshop-product-image position-relative">
                                                <img
                                                    src={getImageUrl(product.image)}
                                                    alt={product.name || "Remedy"}
                                                    className="w-100 h-100 object-fit-contain p-3"
                                                    loading="lazy"
                                                />
                                                {product.tag && <span className="badge bg-success position-absolute top-0 start-0 m-2">{product.tag}</span>}
                                            </div>

                                            <div className="p-3">
                                                <p className="small text-muted mb-1">{Array.isArray(product.category) ? product.category.join(" • ") : product.category || "Ayurvedic remedy"}</p>
                                                <h4 className="h6 mb-2">{product.name || "Unnamed remedy"}</h4>
                                                <div className="d-flex align-items-center justify-content-between gap-2">
                                                    <div>
                                                    <strong className="dshop-price">{formatPrice(getDiscountedPrice(product, previewDiscount))}</strong>
                                                    {previewDiscount > 0 && (
                                                        <del className="d-block small text-muted">{formatPrice(getPrice(product))}</del>
                                                    )}
                                                    </div>
                                                </div>

                                                <div className="input-group input-group-sm mt-3">
                                                    <span className="input-group-text">Discount (%)</span>
                                                    <input
                                                        className="form-control"
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        value={discountValue}
                                                        onChange={(event) => handleDiscountChange(productId, event.target.value)}
                                                        aria-label={`Discount for ${product.name || "product"}`}
                                                    />
                                                    <button
                                                        className="btn btn-outline-success"
                                                        type="button"
                                                        onClick={() => saveDiscount(product)}
                                                        disabled={savingDiscountId === productId}
                                                    >
                                                        {savingDiscountId === productId ? "Saving" : "Save"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}