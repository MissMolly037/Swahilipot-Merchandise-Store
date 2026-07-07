import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiCheckCircle, FiDownload, FiFileText } from "react-icons/fi";
import toast from "react-hot-toast";
import OrderSummary from "../components/OrderSummary";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { orderService } from "../services/api";
import "./Checkout.css";

const Checkout = () => {
	const { cartItems, cartSubtotal, deliveryFee, cartTotal, clearCart } =
		useCart();
	const { user } = useAuth();
	const navigate = useNavigate();

	const [form, setForm] = useState({
		full_name: user?.full_name || "",
		email: user?.email || "",
		phone_number: user?.phone_number || "",
		delivery_location: "",
	});
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState({});
	const [placed, setPlaced] = useState(null);
	const [downloading, setDownloading] = useState(false);

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
		setErrors({ ...errors, [e.target.name]: "" });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setErrors({});
		setLoading(true);
		try {
			const payload = {
				...form,
				student_id: user?.student_id || "",
				items: cartItems.map((i) => ({ product: i.id, quantity: i.quantity })),
			};
			const { data } = await orderService.create(payload);
			setPlaced(data);
			clearCart();
			toast.success("Order placed successfully!");
		} catch (err) {
			const data = err.response?.data || {};
			if (data.error) {
				setErrors({ general: data.error });
				toast.error(data.error);
			} else {
				setErrors(data);
				toast.error("Please fix the errors below");
			}
		} finally {
			setLoading(false);
		}
	};

	const handleDownloadReceipt = async (orderId) => {
		setDownloading(true);
		try {
			const { data } = await orderService.downloadReceipt(orderId);
			const url = window.URL.createObjectURL(
				new Blob([data], { type: "application/pdf" }),
			);
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", `receipt-order-${orderId}.pdf`);
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);
		} catch (err) {
			toast.error("Could not download receipt. Please try again.");
		} finally {
			setDownloading(false);
		}
	};

	const fieldError = (key) => {
		const val = errors[key];
		return val ? (Array.isArray(val) ? val[0] : val) : null;
	};

	if (placed) {
		return (
			<div className="checkout-success">
				<div className="checkout-success__card">
					<div className="checkout-success__icon">
						<FiCheckCircle size={56} />
					</div>
					<h2>Order Placed!</h2>
					<p>
						Your order <strong>#{placed.id}</strong> has been confirmed.
					</p>
					<p className="checkout-success__sub">
						We'll process your order shortly. You can track it in your profile.
					</p>
					<div className="checkout-success__actions">
						<Link
							className="btn btn-outline"
							to={`/orders/${placed.id}/receipt`}>
							<FiFileText size={16} /> View Receipt
						</Link>
						<button
							className="btn btn-dark"
							onClick={() => handleDownloadReceipt(placed.id)}
							disabled={downloading}>
							<FiDownload size={16} />{" "}
							{downloading ? "Preparing..." : "Download Receipt"}
						</button>
						<button
							className="btn btn-primary"
							onClick={() => navigate("/profile")}>
							View My Orders
						</button>
						<button
							className="btn btn-outline"
							onClick={() => navigate("/products")}>
							Continue Shopping
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="checkout-page">
			<div className="checkout-page__header">
				<div className="container">
					<h1>Checkout</h1>
					<p>Complete your order details below</p>
				</div>
			</div>

			<div className="container checkout-page__body">
				<form className="checkout-form" onSubmit={handleSubmit}>
					<h2 className="checkout-form__section-title">Delivery Information</h2>

					{errors.general && (
						<div className="checkout-form__error">{errors.general}</div>
					)}

					<div className="checkout-form__grid">
						<div className="form-group">
							<label>Full Name *</label>
							<input
								name="full_name"
								type="text"
								placeholder="John Kamau"
								value={form.full_name}
								onChange={handleChange}
								required
							/>
							{fieldError("full_name") && (
								<span className="error-msg">{fieldError("full_name")}</span>
							)}
						</div>

						<div className="form-group">
							<label>Email Address *</label>
							<input
								name="email"
								type="email"
								placeholder="john@example.com"
								value={form.email}
								onChange={handleChange}
								required
							/>
							{fieldError("email") && (
								<span className="error-msg">{fieldError("email")}</span>
							)}
						</div>

						<div className="form-group">
							<label>Phone Number *</label>
							<input
								name="phone_number"
								type="tel"
								placeholder="+254 712 000 000"
								value={form.phone_number}
								onChange={handleChange}
								required
							/>
							{fieldError("phone_number") && (
								<span className="error-msg">{fieldError("phone_number")}</span>
							)}
						</div>

						<div className="form-group form-group--full">
							<label>Delivery Address *</label>
							<textarea
								name="delivery_location"
								placeholder="e.g. Nyali Estate, Apartment 12B, Mombasa"
								value={form.delivery_location}
								onChange={handleChange}
								required
								rows={3}
							/>
							{fieldError("delivery_location") && (
								<span className="error-msg">
									{fieldError("delivery_location")}
								</span>
							)}
						</div>
					</div>

					<button
						type="submit"
						className="btn btn-primary checkout-form__submit"
						disabled={loading || cartItems.length === 0}>
						{loading
							? "Placing Order..."
							: `Place Order — KSh ${cartTotal.toFixed(2)}`}
					</button>
				</form>

				<div className="checkout-page__sidebar">
					<OrderSummary
						subtotal={cartSubtotal}
						deliveryFee={deliveryFee}
						total={cartTotal}
						items={cartItems}
					/>
					<div className="checkout-page__security">
						🔒 Your payment and personal data are secured
					</div>
				</div>
			</div>
		</div>
	);
};

export default Checkout;
