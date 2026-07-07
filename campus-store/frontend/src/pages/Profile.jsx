import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
	FiUser,
	FiPackage,
	FiSettings,
	FiEdit3,
	FiSave,
	FiDownload,
	FiFileText,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { authService, orderService } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import "./Profile.css";

const STATUS_COLORS = {
	pending: "#f57c00",
	processing: "#1976d2",
	shipped: "#7b1fa2",
	delivered: "#2e7d32",
	cancelled: "#c62828",
};

const Profile = () => {
	const { user, updateUser } = useAuth();
	const [searchParams] = useSearchParams();
	const [tab, setTab] = useState(() => searchParams.get("tab") || "info");
	const [orders, setOrders] = useState([]);
	const [ordersLoading, setOrdersLoading] = useState(false);
	const [downloadingId, setDownloadingId] = useState(null);
	const [editing, setEditing] = useState(false);
	const [form, setForm] = useState({
		full_name: user?.full_name || "",
		email: user?.email || "",
		phone_number: user?.phone_number || "",
		delivery_location: user?.delivery_location || "",
	});
	const [saving, setSaving] = useState(false);
	const [saveMsg, setSaveMsg] = useState("");

	useEffect(() => {
		if (tab === "orders") {
			setOrdersLoading(true);
			orderService
				.getAll()
				.then(({ data }) => {
					setOrders(data.results || data);
					setOrdersLoading(false);
				})
				.catch(() => setOrdersLoading(false));
		}
	}, [tab]);

	const handleSave = async (e) => {
		e.preventDefault();
		setSaving(true);
		try {
			const { data } = await authService.updateProfile(form);
			updateUser(data);
			setEditing(false);
			setSaveMsg("Profile updated successfully!");
			setTimeout(() => setSaveMsg(""), 3000);
		} catch (err) {
			console.error(err);
		} finally {
			setSaving(false);
		}
	};

	const handleDownloadReceipt = async (orderId) => {
		setDownloadingId(orderId);
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
			setDownloadingId(null);
		}
	};

	return (
		<div className="profile-page">
			<div className="profile-page__header">
				<div className="container">
					<div className="profile-header">
						<div className="profile-header__avatar">
							{user?.full_name?.[0]?.toUpperCase() ||
								user?.username?.[0]?.toUpperCase() ||
								"U"}
						</div>
						<div className="profile-header__info">
							<h1>{user?.full_name || user?.username}</h1>
							<p>{user?.email}</p>
						</div>
					</div>
				</div>
			</div>

			<div className="container profile-page__body">
				<aside className="profile-nav">
					<button
						className={tab === "info" ? "active" : ""}
						onClick={() => setTab("info")}>
						<FiUser size={16} /> My Info
					</button>
					<button
						className={tab === "orders" ? "active" : ""}
						onClick={() => setTab("orders")}>
						<FiPackage size={16} /> Order History
					</button>
					<button
						className={tab === "settings" ? "active" : ""}
						onClick={() => setTab("settings")}>
						<FiSettings size={16} /> Settings
					</button>
				</aside>

				<div className="profile-content">
					{/* Info Tab */}
					{tab === "info" && (
						<div className="profile-section">
							<div className="profile-section__header">
								<h2>Personal Information</h2>
								<button
									className="btn btn-outline profile-edit-btn"
									onClick={() => setEditing(!editing)}>
									<FiEdit3 size={14} /> {editing ? "Cancel" : "Edit"}
								</button>
							</div>

							{saveMsg && <div className="profile-success">{saveMsg}</div>}

							{editing ? (
								<form className="profile-form" onSubmit={handleSave}>
									<div className="profile-form__grid">
										<div className="form-group">
											<label>Full Name</label>
											<input
												value={form.full_name}
												onChange={(e) =>
													setForm({ ...form, full_name: e.target.value })
												}
											/>
										</div>
										<div className="form-group">
											<label>Email</label>
											<input
												type="email"
												value={form.email}
												onChange={(e) =>
													setForm({ ...form, email: e.target.value })
												}
											/>
										</div>
										<div className="form-group">
											<label>Phone Number</label>
											<input
												value={form.phone_number}
												onChange={(e) =>
													setForm({ ...form, phone_number: e.target.value })
												}
											/>
										</div>
										<div className="form-group form-group--full">
											<label>Delivery Location</label>
											<textarea
												value={form.delivery_location}
												rows={3}
												onChange={(e) =>
													setForm({
														...form,
														delivery_location: e.target.value,
													})
												}
											/>
										</div>
									</div>
									<button
										type="submit"
										className="btn btn-primary"
										disabled={saving}>
										<FiSave size={15} /> {saving ? "Saving..." : "Save Changes"}
									</button>
								</form>
							) : (
								<div className="profile-info-grid">
									<div className="profile-info-item">
										<span className="label">Full Name</span>
										<span>{user?.full_name || "—"}</span>
									</div>
									<div className="profile-info-item">
										<span className="label">Username</span>
										<span>@{user?.username}</span>
									</div>
									<div className="profile-info-item">
										<span className="label">Email</span>
										<span>{user?.email || "—"}</span>
									</div>
									<div className="profile-info-item">
										<span className="label">Phone</span>
										<span>{user?.phone_number || "—"}</span>
									</div>
									<div className="profile-info-item profile-info-item--full">
										<span className="label">Delivery Address</span>
										<span>{user?.delivery_location || "—"}</span>
									</div>
								</div>
							)}
						</div>
					)}

					{/* Orders Tab */}
					{tab === "orders" && (
						<div className="profile-section">
							<h2>Order History</h2>
							{ordersLoading ? (
								<LoadingSpinner />
							) : orders.length === 0 ? (
								<EmptyState
									icon="📦"
									title="No orders yet"
									message="Your completed orders will appear here."
									actionLabel="Start Shopping"
									actionTo="/products"
								/>
							) : (
								<div className="orders-list">
									{orders.map((order) => (
										<div key={order.id} className="order-card">
											<div className="order-card__header">
												<div>
													<span className="order-card__id">
														Order #{order.id}
													</span>
													<span className="order-card__date">
														{new Date(order.created_at).toLocaleDateString(
															"en-GH",
															{
																year: "numeric",
																month: "long",
																day: "numeric",
															},
														)}
													</span>
												</div>
												<span
													className="order-card__status"
													style={{
														background: STATUS_COLORS[order.status] + "20",
														color: STATUS_COLORS[order.status],
													}}>
													{order.status.charAt(0).toUpperCase() +
														order.status.slice(1)}
												</span>
											</div>
											<div className="order-card__items">
												{order.items?.map((item) => (
													<div key={item.id} className="order-card__item">
														<span>
															{item.product_name} × {item.quantity}
														</span>
														<span>
															KSh {parseFloat(item.subtotal).toFixed(2)}
														</span>
													</div>
												))}
											</div>
											<div className="order-card__footer">
												<span>Delivery to: {order.delivery_location}</span>
												<span className="order-card__total">
													KSh {parseFloat(order.total_price).toFixed(2)}
												</span>
											</div>
											<div className="order-card__receipt">
												<Link
													className="btn btn-outline"
													to={`/orders/${order.id}/receipt`}>
													<FiFileText size={14} /> View Receipt
												</Link>
												<button
													className="btn btn-outline"
													onClick={() => handleDownloadReceipt(order.id)}
													disabled={downloadingId === order.id}>
													<FiDownload size={14} />
													{downloadingId === order.id
														? "Preparing..."
														: "Download Receipt"}
												</button>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					)}

					{/* Settings Tab */}
					{tab === "settings" && (
						<div className="profile-section">
							<h2>Account Settings</h2>
							<div className="settings-list">
								<div className="settings-item">
									<div>
										<h4>Email Notifications</h4>
										<p>Receive updates about your orders and new arrivals</p>
									</div>
									<label className="toggle">
										<input type="checkbox" defaultChecked />
										<span />
									</label>
								</div>
								<div className="settings-item">
									<div>
										<h4>Newsletter</h4>
										<p>Get exclusive deals and new merchandise updates</p>
									</div>
									<label className="toggle">
										<input type="checkbox" />
										<span />
									</label>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Profile;
