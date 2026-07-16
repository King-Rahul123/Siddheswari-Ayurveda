import "../CSS/Loader.css";
import logo from "../assets/logo.png";

export default function Loader() {
    return (
        <div className="loader-overlay">
            <div className="loader-container">

                <div className="logo-ring">
                    <div className="ring"></div>

                    <img
                        src={logo}
                        alt="Siddheswari Ayurveda"
                        className="loader-logo"
                    />
                </div>

                <h2>Siddheswari Ayurveda</h2>

                <p>Authenticating...</p>

                <div className="loading-bar">
                    <div className="loading-progress"></div>
                </div>

            </div>
        </div>
    );
}