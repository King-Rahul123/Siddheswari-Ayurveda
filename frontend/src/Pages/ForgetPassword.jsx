import { useEffect, useState } from 'react'
import '../ForgetPassword.css'

function ForgetPasswordPage() {
	const [email, setEmail] = useState('')
	const [message, setMessage] = useState('')
	const [isSent, setIsSent] = useState(false)

	useEffect(() => {
		if (!message) {
			return undefined
		}

		const timer = window.setTimeout(() => {
			setMessage('')
		}, 4000)

		return () => {
			window.clearTimeout(timer)
		}
	}, [message])

	const handleSubmit = (event) => {
		event.preventDefault()

		if (!email.trim()) {
			setIsSent(false)
			await resetPassword(email);
			return
		}

		setIsSent(true)
		setMessage(`Reset instructions have been sent to ${email}.`)
	}

	return (
		<main className="recover-page">
			<section className="recover-shell" aria-label="Password recovery">
				<div className="recover-brand">
					<div className="recover-badge">
						<i className="bi bi-shield-lock-fill" aria-hidden="true"></i>
						Password recovery
					</div>

					<h1>Reset your password</h1>
					<p>
						Enter the email address linked to your account and we’ll send a secure reset link.
					</p>

					<div className="recover-points" aria-hidden="true">
						<div className="recover-point">
							<i className="bi bi-envelope-paper-fill"></i>
							Send reset instructions
						</div>
						<div className="recover-point">
							<i className="bi bi-clock-history"></i>
							Fast account recovery
						</div>
					</div>
				</div>

				<div className="recover-card">
					<form className="recover-form" onSubmit={handleSubmit}>
						<div className="recover-heading">
							<h2>Forgot password?</h2>
							<p>We’ll email a secure reset link to get you back into your account.</p>
						</div>

						<label className="recover-field" htmlFor="recoveryEmail">
							<span>Email address</span>
							<div className="recover-input-wrap">
								<i className="bi bi-envelope-at" aria-hidden="true"></i>
								<input
									id="recoveryEmail"
									type="email"
									placeholder="Enter your registered email"
									autoComplete="email"
									value={email}
									onChange={(event) => setEmail(event.target.value)}
									required
								/>
							</div>
						</label>

						<button className="recover-button" type="submit">
							Send reset link
						</button>

						{message ? (
							<p className={`recover-message ${isSent ? 'is-success' : 'is-error'}`} role="status" aria-live="polite">
								<i className={`bi ${isSent ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`} aria-hidden="true"></i>
								<span>{message}</span>
							</p>
						) : null}

						<p className="recover-note">
							This page is standalone and does not depend on the login screen.
						</p>
					</form>
				</div>
			</section>
		</main>
	)
}

export default ForgetPasswordPage
