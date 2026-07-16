import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../Login.css'
import { login } from "../services/authService";
import Loader from "../Components/Loader";

function Login() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		username: '',
		password: '',
		rememberMe: true,
	})
	const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
	const [resetEmail, setResetEmail] = useState('')
	const [statusMessage, setStatusMessage] = useState('')
	const [isError, setIsError] = useState(false);
	const [toastMessage, setToastMessage] = useState('')
	const [loading,setLoading]=useState(false);

	const handleChange = (event) => {
		const { name, type, checked, value } = event.target

		setFormData((current) => ({
			...current,
			[name]: type === 'checkbox' ? checked : value,
		}))

		if (statusMessage) {
			setStatusMessage('')
		}
	}

	const handleSubmit = async (event) => {
		event.preventDefault();

		setLoading(true);
		setStatusMessage("");

		try {
			await login(
				formData.username.trim(),
				formData.password
			);

			setIsError(false);
			setStatusMessage("Login Successful");

			setTimeout(() => {
				navigate("/dashboard");
			}, 1200);

		} catch (error) {
			setLoading(false);
			setIsError(true);
			setStatusMessage(error.message);
		}
	};

	const openForgotPassword = () => {
		setResetEmail("");
		setForgotPasswordOpen(true);
		setStatusMessage("");
	}

	const closeForgotPassword = () => {
		setForgotPasswordOpen(false);
		setResetEmail("");
	}

	useEffect(() => {
		if (!forgotPasswordOpen) {
			return undefined
		}

		const handleKeyDown = (event) => {
			if (event.key === 'Escape') {
				closeForgotPassword()
			}
		}

		window.addEventListener('keydown', handleKeyDown)

		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [forgotPasswordOpen])

	useEffect(() => {
		if (!toastMessage) {
			return undefined
		}

		const timer = window.setTimeout(() => {
			setToastMessage('')
		}, 4000)

		return () => {
			window.clearTimeout(timer)
		}
	}, [toastMessage])

	const handleForgotPasswordSubmit = (event) => {
		event.preventDefault()

		if (!resetEmail.trim()) {
			setStatusMessage('Enter your registered email to receive a reset link.')
			return
		}

		setStatusMessage('')
		setToastMessage(`Password reset instructions sent to ${resetEmail}.`)
		setForgotPasswordOpen(false)
	}

	return (
		<>
			{loading && <Loader />}
			<main className="login-page">

			<section className="login-shell" aria-label="Login form">
				<aside className="login-brand">
					<div>
						<div className="brand-kicker">
							<span className="brand-kicker-dot" aria-hidden="true" />
							Siddheswri Ayurveda
						</div>
					</div>

					<div className="brand-copy">
						<h1>Welcome back</h1>
						<p>
							Sign in to manage patients, therapies, and clinical records in one
							safe and calm workspace.
						</p>
					</div>

					<div className="motif-row" aria-hidden="true">
						<div className="motif-chip">
							<i className="bi bi-heart" aria-hidden="true"></i>
							Herbal care
						</div>
						<div className="motif-chip">
							<i className="bi bi-file-earmark-text" aria-hidden="true"></i>
							Patient records
						</div>
						<div className="motif-chip">
							<i className="bi bi-calendar-check" aria-hidden="true"></i>
							Appointment flow
						</div>
					</div>

					<div className="brand-metrics" aria-hidden="true">
						<div className="metric-card">
							<strong>24/7</strong>
							<span>access to records</span>
						</div>
						<div className="metric-card">
							<strong>99%</strong>
							<span>simpler follow-ups</span>
						</div>
					</div>
				</aside>

				<section className="login-form-panel">
					<form className="login-form" onSubmit={handleSubmit}>
						<div className="form-heading">
								<h2>Login</h2>
								<p>Use your account username and password to continue.</p>
						</div>

						<div className="field-group">
							<div className="field">
								<label htmlFor="username">User Name</label>
								<input
									id="username"
									name="username"
									type="text"
									placeholder="Enter your username"
									autoComplete="username"
									value={formData.username}
									onChange={handleChange}
									required
								/>
							</div>

							<div className="field">
								<label htmlFor="password">Password</label>
								<input
									id="password"
									name="password"
									type="password"
									placeholder="Enter your password"
									autoComplete="current-password"
									value={formData.password}
									onChange={handleChange}
									required
								/>
							</div>
						</div>

						<div className="form-row">
							<label className="remember" htmlFor="rememberMe">
								<input
									id="rememberMe"
									name="rememberMe"
									type="checkbox"
									checked={formData.rememberMe}
									onChange={handleChange}
								/>
								Remember me
							</label>

							<button className="form-link form-link-button" type="button" onClick={openForgotPassword}>
								Forgot password?
							</button>
						</div>

						<button
							className="submit-button"
							type="submit"
							disabled={loading}
						>
							{loading ? (
								<>
									<span className="spinner"></span>
									Signing in...
								</>
							) : (
								"Log in"
							)}
						</button>

						{statusMessage && (
							<p className={`status-message ${isError ? "error" : "success"}`} role="status">
								{statusMessage}
							</p>
						)}

						<p className="form-note">Need access? Contact your administrator to create an account.</p>
					</form>
				</section>
			</section>

			{toastMessage ? (
				<div className="toast-message" role="status" aria-live="polite">
					<i className="bi bi-check-circle-fill" aria-hidden="true"></i>
					<span>{toastMessage}</span>
				</div>
			) : null}

				{forgotPasswordOpen ? (
					<div className="password-modal-backdrop" role="presentation" onClick={closeForgotPassword}>
						<div
							className="password-modal"
							role="dialog"
							aria-modal="true"
							aria-labelledby="forgot-password-title"
							onClick={(event) => event.stopPropagation()}
						>
							<div className="password-modal-header">
								<div>
									<p className="password-modal-kicker">Account recovery</p>
									<h3 id="forgot-password-title">Reset your password</h3>
								</div>
								<button
									className="password-modal-close"
									type="button"
									onClick={closeForgotPassword}
									aria-label="Close password reset popup"
								>
									<i className="bi bi-x-lg" aria-hidden="true"></i>
								</button>
							</div>

							<p className="password-modal-text">
								Enter your registered email address and we’ll send password reset instructions.
							</p>

							<form className="password-modal-form" onSubmit={handleForgotPasswordSubmit}>
								<div className="field">
									<label htmlFor="resetEmail">Registered email</label>
									<input
										id="resetEmail"
										name="resetEmail"
										type="email"
										placeholder="Enter your email address"
										autoComplete="email"
										value={resetEmail}
										onChange={(event) => setResetEmail(event.target.value)}
										required
									/>
								</div>

								<div className="password-modal-actions">
									<button className="password-modal-secondary" type="button" onClick={closeForgotPassword}>
										Cancel
									</button>
									<button className="password-modal-primary" type="submit">
										Send reset link
									</button>
								</div>
							</form>
						</div>
					</div>
				) : null}
		</main>
		</>
	)
}

export default Login
