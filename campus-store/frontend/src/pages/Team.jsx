import { useState, useEffect } from "react";
import { Mail, Globe, Link2 } from "lucide-react";
import { teamService } from "../services/api"; // adjust this path if your api.js lives elsewhere
import "./Team.css";

const Team = () => {
	const [members, setMembers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	useEffect(() => {
		let cancelled = false;

		const fetchTeam = async () => {
			try {
				const { data } = await teamService.getAll();
				if (!cancelled)
					setMembers(Array.isArray(data) ? data : data.results || []);
			} catch (err) {
				if (!cancelled) setError(true);
			} finally {
				if (!cancelled) setLoading(false);
			}
		};

		fetchTeam();
		return () => {
			cancelled = true;
		};
	}, []);

	const initials = (name = "") =>
		name
			.split(" ")
			.filter(Boolean)
			.slice(0, 2)
			.map((n) => n[0].toUpperCase())
			.join("");

	return (
		<section className="team">
			<div className="container team__inner">
				{/* Header */}
				<div className="team__header">
					<span className="team__eyebrow">Our Team</span>
					<h1>The people behind SPH</h1>
					<p>
						A small, hands-on team based in Nairobi — designing, packing, and
						shipping every order ourselves.
					</p>
				</div>

				{/* Loading state */}
				{loading && (
					<div className="team__grid">
						{[...Array(3)].map((_, i) => (
							<div
								key={i}
								className="team__card team__card--skeleton"
								aria-hidden="true">
								<div className="team__avatar team__avatar--skeleton" />
								<div className="team__skeleton-line team__skeleton-line--wide" />
								<div className="team__skeleton-line" />
							</div>
						))}
					</div>
				)}

				{/* Error state */}
				{!loading && error && (
					<div className="team__status">
						<p>
							We couldn't load the team right now. Please try again shortly.
						</p>
					</div>
				)}

				{/* Empty state */}
				{!loading && !error && members.length === 0 && (
					<div className="team__status">
						<p>Team profiles are coming soon.</p>
					</div>
				)}

				{/* Grid */}
				{!loading && !error && members.length > 0 && (
					<div className="team__grid">
						{members.map((member) => (
							<div key={member.id} className="team__card">
								{member.photo ? (
									<img
										className="team__photo"
										src={member.photo}
										alt={member.name}
									/>
								) : (
									<div className="team__avatar" aria-hidden="true">
										{initials(member.name)}
									</div>
								)}
								<h2>{member.name}</h2>
								<span className="team__role">{member.role}</span>
								{member.bio && <p className="team__bio">{member.bio}</p>}
								<div className="team__socials">
									{member.email && (
										<a
											href={`mailto:${member.email}`}
											aria-label={`Email ${member.name}`}>
											<Mail size={16} />
										</a>
									)}
									{member.linkedin_url && (
										<a
											href={member.linkedin_url}
											aria-label={`${member.name} on LinkedIn`}
											target="_blank"
											rel="noreferrer">
											<Link2 size={16} />
										</a>
									)}
									{member.twitter_url && (
										<a
											href={member.twitter_url}
											aria-label={`${member.name} on Twitter`}
											target="_blank"
											rel="noreferrer">
											<Globe size={16} />
										</a>
									)}
								</div>
							</div>
						))}
					</div>
				)}

				{/* CTA */}
				<div className="team__cta">
					<h2>Want to work with us?</h2>
					<p>
						We're always open to meeting people who care about good design and
						good service.
					</p>
					<a href="/contact" className="btn btn-dark">
						Get in touch
					</a>
				</div>
			</div>
		</section>
	);
};

export default Team;
