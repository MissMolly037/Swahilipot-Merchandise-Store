import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiDownload, FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import toast from "react-hot-toast";
import { orderService } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import "./Receipt.css";

const STATUS_COLORS = {
	pending: "#f57c00",
	processing: "#1976d2",
	shipped: "#7b1fa2",
	delivered: "#2e7d32",
	cancelled: "#c62828",
};

const Receipt = () => {
	const { id } = useParams();
	const [order, setOrder] = useState(null);
	const [loading, setLoading] = useState(true);
	const [downloading, setDownloading] = useState(false);

	useEffect(() => {
		setLoading(true);
		orderService
			.getOne(id)
			.then(({ data }) => setOrder(data))
			.catch(() => setOrder(null))
			.finally(() => setLoading(false));
	}, [id]);

	const handleDownload = async () => {
		setDownloading(true);
		try {
			const { data } = await orderService.downloadReceipt(id);
			const url = window.URL.createObjectURL(
				new Blob([data], { type: "application/pdf" }),
			);
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", `receipt-order-${id}.pdf`);
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

	if (loading) return <LoadingSpinner text="Loading receipt..." />;

	if (!order) {
		return (
			<div className="container page-wrapper text-center">
				<h2>Receipt not found</h2>
				<Link
					to="/profile?tab=orders"
					className="btn btn-primary"
					style={{ marginTop: 20 }}>
					Back to Orders
				</Link>
			</div>
		);
	}

	const subtotal =
		parseFloat(order.total_price) - parseFloat(order.delivery_fee);

	return (
		<div className="receipt-page">
			<div className="container receipt-page__container">
				<Link to="/profile?tab=orders" className="receipt-page__back">
					<FiArrowLeft size={16} /> Back to Orders
				</Link>

				<div className="receipt-card">
					<div className="receipt-card__brand">
						<h1>Swahilipot Hub</h1>
						<p>Official Payment Receipt</p>
					</div>

					<div className="receipt-card__confirm">
						<FiCheckCircle size={20} />
						<span>Payment confirmed for this order</span>
					</div>

					<div className="receipt-card__meta">
						<div>
							<span className="label">Order</span>
							<span className="value">#{order.id}</span>
						</div>
						<div>
							<span className="label">Date</span>
							<span className="value">
								{new Date(order.created_at).toLocaleDateString("en-GH", {
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							</span>
						</div>
						<div>
							<span className="label">Status</span>
							<span
								className="value receipt-card__status"
								style={{
									background: `${STATUS_COLORS[order.status]}20`,
									color: STATUS_COLORS[order.status],
								}}>
								{order.status.charAt(0).toUpperCase() + order.status.slice(1)}
							</span>
						</div>
					</div>

					<div className="receipt-card__section">
						<h3>Delivery Details</h3>
						<p>
							<strong>{order.full_name}</strong>
						</p>
						<p>{order.email}</p>
						<p>{order.phone_number}</p>
						<p>{order.delivery_location}</p>
					</div>

					<div className="receipt-card__section">
						<h3>Items</h3>
						<div className="receipt-items">
							{order.items?.map((item) => (
								<div key={item.id} className="receipt-items__row">
									<span>
										{item.product_name} × {item.quantity}
									</span>
									<span>KSh {parseFloat(item.subtotal).toFixed(2)}</span>
								</div>
							))}
						</div>
					</div>

					<div className="receipt-totals">
						<div className="receipt-totals__row">
							<span>Subtotal</span>
							<span>KSh {subtotal.toFixed(2)}</span>
						</div>
						<div className="receipt-totals__row">
							<span>Delivery Fee</span>
							<span>KSh {parseFloat(order.delivery_fee).toFixed(2)}</span>
						</div>
						<div className="receipt-totals__row receipt-totals__row--total">
							<span>Total Paid</span>
							<span>KSh {parseFloat(order.total_price).toFixed(2)}</span>
						</div>
					</div>

					<button
						className="btn btn-primary receipt-card__download"
						onClick={handleDownload}
						disabled={downloading}>
						<FiDownload size={16} />
						{downloading ? "Preparing PDF..." : "Download PDF Receipt"}
					</button>

					<p className="receipt-card__footnote">
						This is a system-generated receipt and does not require a signature.
					</p>
				</div>
			</div>
		</div>
	);
};

export default Receipt;
