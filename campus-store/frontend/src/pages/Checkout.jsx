import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
	FiCheckCircle,
	FiDownload,
	FiFileText,
	FiSmartphone,
	FiCreditCard,
	FiTruck,
	FiArrowLeft,
	FiLock,
	FiCheck,
} from "react-icons/fi";
import toast from "react-hot-toast";
import OrderSummary from "../components/OrderSummary";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { orderService } from "../services/api";
import "./Checkout.css";

const STEPS = [
	{ key: "details", label: "Delivery" },
	{ key: "payment", label: "Payment" },
	{ key: "success", label: "Confirmation" },
];

const PAYMENT_METHODS = [
	{
		key: "mpesa",
		label: "M-Pesa",
		desc: "Pay via STK push",
		icon: FiSmartphone,
	},
	{
		key: "card",
		label: "Card",
		desc: "Visa / Mastercard",
		icon: FiCreditCard,
	},
	{
		key: "cod",
		label: "Cash on Delivery",
		desc: "Pay when it arrives",
		icon: FiTruck,
	},
];

const Checkout = () => {
	const { cartItems, cartSubtotal, deliveryFee, cartTotal, clearCart } =
		useCart();
	const { user } = useAuth();
	const navigate = useNavigate();

	const [step, setStep] = useState("details");

	const [form, setForm] = useState({
		full_name: user?.full_name || "",
		email: user?.email || "",
		phone_number: user?.phone_number || "",
		delivery_location: "",
	});
	const [errors, setErrors] = useState({});

	const [paymentMethod, setPaymentMethod] = useState("mpesa");
	const [mpesaPhone, setMpesaPhone] = useState(user?.phone_number || "");
	const [card, setCard] = useState({
		number: "",
		expiry: "",
		cvv: "",
		name: "",
	});
	const [paymentErrors, setPaymentErrors] = useState({});

	const [loading, setLoading] = useState(false);
	const [placed, setPlaced] = useState(null);
	const [downloading, setDownloading] = useState(false);

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
		setErrors({ ...errors, [e.target.name]: "" });
	};

	const fieldError = (key) => {
		const val = errors[key];
		return val ? (Array.isArray(val) ? val[0] : val) : null;
	};

	// Step 1 -> Step 2
	const handleContinueToPayment = (e) => {
		e.preventDefault();
		setErrors({});
		if (cartItems.length === 0) {
			toast.error("Your cart is empty");
			return;
		}
		setStep("payment");
	};

	const handleCardInput = (e) => {
		const { name, value } = e.target;
		let v = value;
		if (name === "number") {
			v = v
				.replace(/\D/g, "")
				.slice(0, 16)
				.replace(/(.{4})/g, "$1 ")
				.trim();
		}
		if (name === "expiry") {
			v = v
				.replace(/\D/g, "")
				.slice(0, 4)
				.replace(/(\d{2})(\d{0,2})/, (m, a, b) => (b ? `${a}/${b}` : a));
		}
		if (name === "cvv") {
			v = v.replace(/\D/g, "").slice(0, 3);
		}
		setCard({ ...card, [name]: v });
		setPaymentErrors({ ...paymentErrors, [name]: "" });
	};

	const validatePayment = () => {
		const errs = {};
		if (paymentMethod === "mpesa") {
			if (!/^(\+?254|0)7\d{8}$/.test(mpesaPhone.replace(/\s/g, ""))) {
				errs.mpesaPhone = "Enter a valid Safaricom number, e.g. 0712 000 000";
			}
		}
		if (paymentMethod === "card") {
			if (card.number.replace(/\s/g, "").length !== 16)
				errs.number = "Enter a valid 16-digit card number";
			if (!/^\d{2}\/\d{2}$/.test(card.expiry))
				errs.expiry = "Enter expiry as MM/YY";
			if (card.cvv.length !== 3) errs.cvv = "Enter a valid 3-digit CVV";
			if (!card.name.trim()) errs.name = "Enter the name on the card";
		}
		setPaymentErrors(errs);
		return Object.keys(errs).length === 0;
	};

	const handlePlaceOrder = async () => {
		if (!validatePayment()) return;
		setLoading(true);
		try {
			const payload = {
				...form,
				student_id: user?.student_id || "",
				items: cartItems.map((i) => ({ product: i.id, quantity: i.quantity })),
				payment_method: paymentMethod,
				...(paymentMethod === "mpesa" && { mpesa_phone: mpesaPhone }),
				...(paymentMethod === "card" && {
					card_last4: card.number.replace(/\s/g, "").slice(-4),
				}),
			};
			const { data } = await orderService.create(payload);
			setPlaced(data);
			clearCart();
			setStep("success");
			toast.success("Order placed successfully!");
		} catch (err) {
			const data = err.response?.data || {};
			if (data.error) {
				toast.error(data.error);
			} else {
				setErrors(data);
				setStep("details");
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

	const currentStepIndex = STEPS.findIndex((s) => s.key === step);

	if (step === "success" && placed) {
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

			<div className="container checkout-stepper">
				{STEPS.map((s, i) => (
					<div
						key={s.key}
						className={`checkout-stepper__item ${
							i < currentStepIndex
								? "is-done"
								: i === currentStepIndex
									? "is-active"
									: ""
						}`}>
						<span className="checkout-stepper__circle">
							{i < currentStepIndex ? <FiCheck size={14} /> : i + 1}
						</span>
						<span className="checkout-stepper__label">{s.label}</span>
						{i < STEPS.length - 1 && (
							<span className="checkout-stepper__line" />
						)}
					</div>
				))}
			</div>

			<div className="container checkout-page__body">
				{step === "details" && (
					<form className="checkout-form" onSubmit={handleContinueToPayment}>
						<h2 className="checkout-form__section-title">
							Delivery Information
						</h2>

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
									<span className="error-msg">
										{fieldError("phone_number")}
									</span>
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
							disabled={cartItems.length === 0}>
							Continue to Payment
						</button>
					</form>
				)}

				{step === "payment" && (
					<div className="checkout-form">
						<button
							type="button"
							className="checkout-form__back"
							onClick={() => setStep("details")}>
							<FiArrowLeft size={14} /> Back to delivery details
						</button>

						<h2 className="checkout-form__section-title">Payment Method</h2>

						<div className="payment-methods">
							{PAYMENT_METHODS.map((m) => {
								const Icon = m.icon;
								return (
									<button
										type="button"
										key={m.key}
										className={`payment-method ${
											paymentMethod === m.key ? "is-selected" : ""
										}`}
										onClick={() => setPaymentMethod(m.key)}>
										<span className="payment-method__icon">
											<Icon size={20} />
										</span>
										<span className="payment-method__text">
											<strong>{m.label}</strong>
											<small>{m.desc}</small>
										</span>
										<span className="payment-method__radio" />
									</button>
								);
							})}
						</div>

						<div className="payment-detail">
							{paymentMethod === "mpesa" && (
								<div className="form-group">
									<label>M-Pesa Phone Number *</label>
									<input
										type="tel"
										placeholder="0712 000 000"
										value={mpesaPhone}
										onChange={(e) => {
											setMpesaPhone(e.target.value);
											setPaymentErrors({ ...paymentErrors, mpesaPhone: "" });
										}}
									/>
									{paymentErrors.mpesaPhone && (
										<span className="error-msg">
											{paymentErrors.mpesaPhone}
										</span>
									)}
									<p className="payment-detail__hint">
										You'll receive an STK push prompt on this number to complete
										payment of <strong>KSh {cartTotal.toFixed(2)}</strong>.
									</p>
								</div>
							)}

							{paymentMethod === "card" && (
								<div className="checkout-form__grid">
									<div className="form-group form-group--full">
										<label>Card Number *</label>
										<input
											name="number"
											type="text"
											inputMode="numeric"
											placeholder="1234 5678 9012 3456"
											value={card.number}
											onChange={handleCardInput}
										/>
										{paymentErrors.number && (
											<span className="error-msg">{paymentErrors.number}</span>
										)}
									</div>
									<div className="form-group form-group--full">
										<label>Name on Card *</label>
										<input
											name="name"
											type="text"
											placeholder="John Kamau"
											value={card.name}
											onChange={handleCardInput}
										/>
										{paymentErrors.name && (
											<span className="error-msg">{paymentErrors.name}</span>
										)}
									</div>
									<div className="form-group">
										<label>Expiry *</label>
										<input
											name="expiry"
											type="text"
											inputMode="numeric"
											placeholder="MM/YY"
											value={card.expiry}
											onChange={handleCardInput}
										/>
										{paymentErrors.expiry && (
											<span className="error-msg">{paymentErrors.expiry}</span>
										)}
									</div>
									<div className="form-group">
										<label>CVV *</label>
										<input
											name="cvv"
											type="password"
											inputMode="numeric"
											placeholder="123"
											value={card.cvv}
											onChange={handleCardInput}
										/>
										{paymentErrors.cvv && (
											<span className="error-msg">{paymentErrors.cvv}</span>
										)}
									</div>
								</div>
							)}

							{paymentMethod === "cod" && (
								<p className="payment-detail__hint">
									Pay in cash to the courier when your order arrives. Please
									have the exact amount of{" "}
									<strong>KSh {cartTotal.toFixed(2)}</strong> ready.
								</p>
							)}
						</div>

						<button
							type="button"
							className="btn btn-primary checkout-form__submit"
							onClick={handlePlaceOrder}
							disabled={loading}>
							<FiLock size={15} />{" "}
							{loading
								? "Processing Payment..."
								: `Pay KSh ${cartTotal.toFixed(2)} & Place Order`}
						</button>
					</div>
				)}

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
