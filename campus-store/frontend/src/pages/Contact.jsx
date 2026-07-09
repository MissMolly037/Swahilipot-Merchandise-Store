import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import { contactService } from "../services/api"; // adjust this path if your api.js lives elsewhere
import "./Contact.css";

const SUBJECT_OPTIONS = [
	"Order Inquiry",
	"Returns & Exchanges",
	"Product Question",
	"Wholesale / Partnership",
	"Feedback",
	"Something Else",
];

const CONTACT_DETAILS = [
	{
		icon: Mail,
		label: "Email",
		value: "support@sph.co.ke",
		href: "mailto:support@sph.co.ke",
	},
	{
		icon: Phone,
		label: "Phone",
		value: "+254 700 000 000",
		href: "tel:+254700000000",
	},
	{
		icon: MapPin,
		label: "Studio",
		value: "Kilimani, Nairobi, Kenya",
		href: "https://maps.google.com/?q=Kilimani,Nairobi",
	},
	{
		icon: Clock,
		label: "Hours",
		value: "Mon – Fri, 9:00 AM – 6:00 PM EAT",
		href: null,
	},
];

const initialForm = {
	name: "",
	email: "",
	subject: SUBJECT_OPTIONS[0],
	message: "",
};

const Contact = () => {
	const [form, setForm] = useState(initialForm);
	const [errors, setErrors] = useState({});
	const [submitting, setSubmitting] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
		if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
	};

	const validate = () => {
		const next = {};
		if (!form.name.trim()) next.name = "Please enter your name.";
		if (!form.email.trim()) {
			next.email = "Please enter your email.";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
			next.email = "Please enter a valid email address.";
		}
		if (!form.message.trim()) {
			next.message = "Please write a message.";
		} else if (form.message.trim().length < 10) {
			next.message = "Please provide a few more details (10+ characters).";
		}
		setErrors(next);
		return Object.keys(next).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validate()) return;

		setSubmitting(true);
		try {
			await contactService.send(form);
			toast.success("Message sent — we'll be in touch within 1 business day.");
			setForm(initialForm);
		} catch (err) {
			const fieldErrors = err.response?.data;
			if (fieldErrors && typeof fieldErrors === "object") {
				// DRF returns { field: ["error message"] } on validation failures
				const mapped = {};
				Object.entries(fieldErrors).forEach(([key, val]) => {
					mapped[key] = Array.isArray(val) ? val[0] : val;
				});
				setErrors((prev) => ({ ...prev, ...mapped }));
			}
			toast.error("Something went wrong. Please check the form and try again.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<section className="contact">
			<div className="container contact__inner">
				{/* Header */}
				<div className="contact__header">
					<span className="contact__eyebrow">Contact Us</span>
					<h1>We'd love to hear from you</h1>
					<p>
						Questions about an order, a product, or a partnership? Send us a
						message and our team will get back to you within one business day.
					</p>
				</div>

				<div className="contact__grid">
					{/* Info column */}
					<div className="contact__info">
						<div className="contact__info-card">
							<h2>Reach us directly</h2>
							<ul className="contact__detail-list">
								{CONTACT_DETAILS.map(({ icon: Icon, label, value, href }) => (
									<li key={label} className="contact__detail-item">
										<span className="contact__detail-icon">
											<Icon size={18} />
										</span>
										<span className="contact__detail-text">
											<span className="contact__detail-label">{label}</span>
											{href ? (
												<a
													href={href}
													target={
														href.startsWith("http") ? "_blank" : undefined
													}
													rel="noreferrer">
													{value}
												</a>
											) : (
												<span>{value}</span>
											)}
										</span>
									</li>
								))}
							</ul>
						</div>

						<div className="contact__note">
							<MessageSquare size={18} />
							<p>
								Already have an order number? Include it in your message so we
								can look into it right away.
							</p>
						</div>
					</div>

					{/* Form column */}
					<form className="contact__form" onSubmit={handleSubmit} noValidate>
						<div className="contact__form-row">
							<div className="contact__field">
								<label htmlFor="contact-name">Full name</label>
								<input
									id="contact-name"
									name="name"
									type="text"
									placeholder="Jane Wanjiru"
									value={form.name}
									onChange={handleChange}
									aria-invalid={!!errors.name}
									className={errors.name ? "has-error" : ""}
								/>
								{errors.name && (
									<span className="contact__error">{errors.name}</span>
								)}
							</div>

							<div className="contact__field">
								<label htmlFor="contact-email">Email address</label>
								<input
									id="contact-email"
									name="email"
									type="email"
									placeholder="jane@example.com"
									value={form.email}
									onChange={handleChange}
									aria-invalid={!!errors.email}
									className={errors.email ? "has-error" : ""}
								/>
								{errors.email && (
									<span className="contact__error">{errors.email}</span>
								)}
							</div>
						</div>

						<div className="contact__field">
							<label htmlFor="contact-subject">Subject</label>
							<select
								id="contact-subject"
								name="subject"
								value={form.subject}
								onChange={handleChange}>
								{SUBJECT_OPTIONS.map((option) => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</select>
						</div>

						<div className="contact__field">
							<label htmlFor="contact-message">Message</label>
							<textarea
								id="contact-message"
								name="message"
								rows={6}
								placeholder="Tell us a bit about what you need..."
								value={form.message}
								onChange={handleChange}
								aria-invalid={!!errors.message}
								className={errors.message ? "has-error" : ""}
							/>
							{errors.message && (
								<span className="contact__error">{errors.message}</span>
							)}
						</div>

						<button
							type="submit"
							className="contact__submit"
							disabled={submitting}>
							{submitting ? (
								"Sending…"
							) : (
								<>
									Send message <Send size={16} />
								</>
							)}
						</button>
					</form>
				</div>
			</div>
		</section>
	);
};

export default Contact;
