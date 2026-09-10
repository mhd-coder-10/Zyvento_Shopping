import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff, FiCheck,
    FiAlertCircle, FiShoppingBag, FiTruck, FiShield, FiTag, FiArrowRight,
} from "react-icons/fi";

import LoadingSpinner from '../common/LoadingSpinner';

//  STYLE TOKENS — layout/spacing inline (Tailwind-proof)
const C = {
    orange: "#f97316",
    orangeDark: "#ea580c",
    amber: "#f59e0b",
    slate900: "#0f172a",
    slate700: "#334155",
    slate500: "#64748b",
    slate400: "#94a3b8",
    slate200: "#e2e8f0",
    rose: "#e11d48",
};

const st = {
    page: { minHeight: "100vh", width: "100%", background: "#f8fafc", display: "flex" },
    left: {
        position: "relative", overflow: "hidden", background: "#120c05",
        padding: "48px", display: "flex", flexDirection: "column",
        justifyContent: "space-between", flex: "1.05 1 0%",
    },
    right: {
        flex: "1 1 0%", display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 24px", background: "linear-gradient(180deg,#f8fafc,#f1f5f9)",
    },
    card: {
        width: "100%", maxWidth: "440px", background: "#fff", borderRadius: "24px",
        border: "1px solid #f1f5f9", padding: "36px 32px",
        boxShadow: "0 20px 60px -20px rgba(15,23,42,.25)",
    },
    label: {
        display: "block", marginBottom: "6px", fontSize: "13px",
        fontWeight: 600, color: C.slate700,
    },
    inputWrap: { position: "relative", width: "100%" },
    input: (hasError, hasRight) => ({
        width: "100%", boxSizing: "border-box",
        padding: `13px ${hasRight ? "46px" : "16px"} 13px 44px`,
        fontSize: "15px", lineHeight: "20px", color: C.slate900,
        background: "#fff", borderRadius: "12px",
        border: `1px solid ${hasError ? "#fb7185" : C.slate200}`,
        outline: "none", transition: "border-color .2s, box-shadow .2s",
    }),
    iconLeft: {
        position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
        fontSize: "17px", color: C.slate400, pointerEvents: "none",
        display: "flex", alignItems: "center",
    },
    eyeBtn: {
        position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)",
        height: "32px", width: "32px", display: "grid", placeItems: "center",
        border: "none", background: "transparent", cursor: "pointer",
        color: C.slate400, borderRadius: "8px",
    },
    errText: {
        marginTop: "6px", display: "flex", alignItems: "center", gap: "6px",
        fontSize: "12px", fontWeight: 500, color: C.rose,
    },
    field: { marginBottom: "18px" },
    primaryBtn: (disabled) => ({
        width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
        gap: "8px", padding: "14px 16px", marginTop: "4px",
        borderRadius: "12px", border: "none", cursor: disabled ? "not-allowed" : "pointer",
        background: `linear-gradient(90deg, ${C.orange}, ${C.amber})`,
        color: "#fff", fontSize: "15px", fontWeight: 700,
        boxShadow: "0 10px 25px -8px rgba(249,115,22,.55)",
        opacity: disabled ? 0.6 : 1,
    }),
    linkBtn: {
        background: "none", border: "none", padding: 0, cursor: "pointer",
        color: C.orangeDark, fontWeight: 700, fontSize: "14px",
    },
};

const focusOn = (e, err) => {
    e.target.style.borderColor = err ? "#f43f5e" : C.orange;
    e.target.style.boxShadow = `0 0 0 4px ${err ? "rgba(244,63,94,.15)" : "rgba(249,115,22,.15)"}`;
};
const focusOff = (e, err) => {
    e.target.style.borderColor = err ? "#fb7185" : C.slate200;
    e.target.style.boxShadow = "none";
};

const AuthForm = ({
    type: initialType = "login",
    onSubmit,
    onVerifyOtp,
    onResendOtp,
    onSwitchMode,
    loading = false,
    otpLoading = false,
    error = null,
    otpError = null,
    otpSent = false,
    otpVerified = false,
    timer = 60,
    canResend = false,
}) => {
    const [type, setType] = useState(initialType);
    useEffect(() => setType(initialType), [initialType]);

    const navigate = useNavigate();
    const formSubmitted = useRef(false);
    const isAutoFilled = useRef(false);
    const [isLoginSuccess, setIsLoginSuccess] = useState(false);

    const switchMode = (next) => {
        setType(next);
        if (onSwitchMode) onSwitchMode(next);

        if (next === 'login') {
            navigate('/login');
        } else if (next === 'register') {
            navigate('/register');
        }

        setFormErrors({});
        setFormData({
            firstName: "", lastName: "", email: "", password: "",
            confirmPassword: "", mobileNumber: "", termsAccepted: false,
        });
        setOtp(["", "", "", "", "", ""]);
        setOtpErrorLocal("");
        formSubmitted.current = false;
        isAutoFilled.current = false;
        setIsLoginSuccess(false);
    };

    const [formData, setFormData] = useState({
        firstName: "", lastName: "", email: "", password: "",
        confirmPassword: "", mobileNumber: "", termsAccepted: false,
    });

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [formErrors, setFormErrors] = useState({});
    const [touchedFields, setTouchedFields] = useState({});
    const [otpErrorLocal, setOtpErrorLocal] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Handle auto-fill detection for login
    useEffect(() => {
        if (type === "login") {
            const checkAutoFill = () => {
                const emailInput = document.querySelector('input[name="email"]');
                const passwordInput = document.querySelector('input[name="password"]');

                if (emailInput?.value && passwordInput?.value) {
                    isAutoFilled.current = true;
                    setFormData(prev => ({
                        ...prev,
                        email: emailInput.value,
                        password: passwordInput.value
                    }));
                }
            };

            const timer = setTimeout(checkAutoFill, 500);

            const handleInput = () => {
                const emailInput = document.querySelector('input[name="email"]');
                const passwordInput = document.querySelector('input[name="password"]');

                if (emailInput?.value && passwordInput?.value) {
                    isAutoFilled.current = true;
                    setFormData(prev => ({
                        ...prev,
                        email: emailInput.value,
                        password: passwordInput.value
                    }));
                }
            };

            document.addEventListener('input', handleInput);

            return () => {
                clearTimeout(timer);
                document.removeEventListener('input', handleInput);
            };
        }
    }, [type]);

    // Reset submit flag when loading changes
    useEffect(() => {
        if (!loading) {
            setTimeout(() => {
                formSubmitted.current = false;
            }, 500);
        }
    }, [loading]);

    // Handle successful login - clear fields
    useEffect(() => {
        if (type === "login" && !loading && !error && formData.email && formData.password) {
            if (formSubmitted.current) {
                setIsLoginSuccess(true);
                setFormData(prev => ({
                    ...prev,
                    email: "",
                    password: ""
                }));
                formSubmitted.current = false;
            }
        }
    }, [loading, error, type, formData.email, formData.password]);

    const handleChange = (e) => {
        const { name, value, type: inputType, checked } = e.target;
        setFormData((prev) => ({ ...prev, [name]: inputType === "checkbox" ? checked : value }));
        if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
        formSubmitted.current = false;
        isAutoFilled.current = false;
        setIsLoginSuccess(false);
    };

    const handleMobileChange = (e) => {
        const value = e.target.value.replace(/\D/g, "").slice(0, 10);
        setFormData((prev) => ({ ...prev, mobileNumber: value }));
        if (formErrors.mobileNumber) setFormErrors((prev) => ({ ...prev, mobileNumber: "" }));
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouchedFields((prev) => ({ ...prev, [name]: true }));
        validateField(name);
    };

    const validateField = (fieldName) => {
        let message = "";
        switch (fieldName) {
            case "firstName":
                if (type === "register" && !formData.firstName.trim()) message = "First name is required";
                break;
            case "lastName":
                if (type === "register" && !formData.lastName.trim()) message = "Last name is required";
                break;
            case "mobileNumber":
                if (type === "register" && !formData.mobileNumber) message = "Mobile number is required";
                else if (type === "register" && !/^[0-9]{10}$/.test(formData.mobileNumber))
                    message = "Enter valid 10 digit mobile number";
                break;
            case "email":
                if (!formData.email.trim()) message = "Email is required";
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) message = "Enter valid email address";
                break;
            case "password":
                if (!formData.password) message = "Password is required";
                else if (formData.password.length < 8) message = "Password must contain minimum 8 characters";
                break;
            case "confirmPassword":
                if ((type === "register" || type === "reset") && formData.password !== formData.confirmPassword)
                    message = "Passwords do not match";
                break;
            case "termsAccepted":
                if (type === "register" && !formData.termsAccepted) message = "Accept terms and conditions";
                break;
            default: break;
        }
        setFormErrors((prev) => ({ ...prev, [fieldName]: message }));
        return message;
    };

    const validate = () => {
        const errors = {};

        if (type === "register") {
            if (!formData.firstName.trim()) errors.firstName = "First name is required";
            if (!formData.lastName.trim()) errors.lastName = "Last name is required";
            if (!formData.mobileNumber) errors.mobileNumber = "Mobile number is required";
            else if (!/^[0-9]{10}$/.test(formData.mobileNumber)) errors.mobileNumber = "Enter valid mobile number";
            if (formData.password !== formData.confirmPassword) {
                errors.confirmPassword = "Passwords do not match";
            }
            if (!formData.termsAccepted) errors.termsAccepted = "Accept terms and conditions";
        }

        if (type === "login") {
            if (!formData.email.trim()) errors.email = "Email is required";
            if (!formData.password.trim()) errors.password = "Password is required";
        }

        if (type === "forgot") {
            if (!formData.email.trim()) {
                errors.email = "Email is required";
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                errors.email = "Enter valid email address";
            }
        }

        if (type === "reset") {
            if (!formData.password || formData.password.length < 8) {
                errors.password = "Password must be at least 8 characters";
            } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
                errors.password = "Password must contain uppercase, lowercase, number and special character";
            }
            if (formData.password !== formData.confirmPassword) {
                errors.confirmPassword = "Passwords do not match";
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleOtpChange = (index, value) => {
        if (!/^[0-9]?$/.test(value)) return;
        const updatedOtp = [...otp];
        updatedOtp[index] = value;
        setOtp(updatedOtp);
        if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
        setOtpErrorLocal("");
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0)
            document.getElementById(`otp-${index - 1}`)?.focus();
    };

    const verifyOtp = () => {
        const otpCode = otp.join("");
        if (otpCode.length !== 6) {
            setOtpErrorLocal("Please enter 6 digit OTP");
            return;
        }
        onVerifyOtp({
            email: formData.email,
            otp: otpCode,
            purpose: "user_registration",
            password: formData.password
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (formSubmitted.current || loading) {
            return;
        }

        if (!validate()) {
            return;
        }

        if (type === "login") {
            if (!formData.email.trim() || !formData.password.trim()) {
                setFormErrors(prev => ({
                    ...prev,
                    email: !formData.email.trim() ? "Email is required" : "",
                    password: !formData.password.trim() ? "Password is required" : ""
                }));
                return;
            }
        }

        formSubmitted.current = true;

        if (type === "register") {
            onSubmit({
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                password: formData.password,
                mobile_number: formData.mobileNumber,
                terms_accepted: formData.termsAccepted,
            });
        }
        else if (type === "login") {
            onSubmit({ email: formData.email, password: formData.password });
        }
        else if (type === "forgot") {
            onSubmit({ email: formData.email });
        }
        else if (type === "reset") {
            onSubmit({
                newPassword: formData.password,
                confirmPassword: formData.confirmPassword
            });
        }
    };

    const handleClearFields = () => {
        setFormData({
            firstName: "", lastName: "", email: "", password: "",
            confirmPassword: "", mobileNumber: "", termsAccepted: false,
        });
        setFormErrors({});
        setOtp(["", "", "", "", "", ""]);
        formSubmitted.current = false;
        isAutoFilled.current = false;
        setIsLoginSuccess(false);
    };

    const getPasswordStrength = () => {
        const password = formData.password;
        if (!password) return { text: "", width: "0%", color: "#e2e8f0" };
        let score = 0;
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[@$!%*?&]/.test(password)) score++;
        const strength = [
            { text: "Weak", width: "20%", color: "#f43f5e" },
            { text: "Fair", width: "40%", color: "#f97316" },
            { text: "Good", width: "60%", color: "#fbbf24" },
            { text: "Strong", width: "80%", color: "#84cc16" },
            { text: "Very Strong", width: "100%", color: "#10b981" },
        ];
        return strength[Math.min(score, 4)];
    };

    const heading = {
        login: { badge: "Member Login", title: "Welcome back", description: "Sign in to pick up your cart where you left it." },
        register: { badge: "New Account", title: "Create your account", description: "One account — 10,000+ verified sellers, one checkout." },
        forgot: { badge: "Account Recovery", title: "Forgot password?", description: "Enter your registered email, we will send you a reset link." },
        reset: { badge: "Security", title: "Set a new password", description: "Choose a strong password to keep your account secure." },
    };
    const footer = {
        login: { text: "New here?", link: "Create an account", mode: "register" },
        register: { text: "Already have an account?", link: "Sign in", mode: "login" },
        forgot: { text: "Remember password?", link: "Sign in", mode: "login" },
        reset: { text: "Remember password?", link: "Sign in", mode: "login" },
    };
    const submitLabel = {
        login: "Sign in", register: "Create my account",
        forgot: "Send reset link", reset: "Reset password",
    };

    const isOtpLocked = otpSent && !otpVerified;
    const strength = getPasswordStrength();
    const isWide = typeof window !== "undefined" ? window.innerWidth >= 1024 : true;

    return (
        <div style={st.page} className="auth-shell">
            {/* LEFT : BRAND PANEL */}
            <aside style={st.left} className="auth-left">
                <div style={{ position: "absolute", left: "-140px", top: "-100px", height: "420px", width: "420px", borderRadius: "999px", background: "rgba(249,115,22,.25)", filter: "blur(110px)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", right: "-80px", bottom: "-120px", height: "380px", width: "380px", borderRadius: "999px", background: "rgba(245,158,11,.12)", filter: "blur(110px)", pointerEvents: "none" }} />
                <div style={{
                    position: "absolute", inset: 0, opacity: 0.07, pointerEvents: "none",
                    backgroundImage: "linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)",
                    backgroundSize: "64px 64px",
                }} />

                <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{
                        height: "48px", width: "48px", flexShrink: 0, display: "grid", placeItems: "center",
                        borderRadius: "16px", background: `linear-gradient(135deg,${C.orange},${C.amber})`,
                        color: "#fff", fontSize: "20px", boxShadow: "0 10px 25px -8px rgba(249,115,22,.6)",
                    }}>
                        <FiShoppingBag />
                    </span>
                    <span style={{ minWidth: 0 }}>
                        <span style={{ display: "block", fontSize: "20px", fontWeight: 800, color: "#fff", letterSpacing: "-.02em", letterSpacing: "0.3em" }}>
                            ZYVENTO
                        </span>
                        <span style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: ".3em", color: "#fb923c" }}>
                            SHOPPING
                        </span>
                    </span>
                </div>

                <div style={{ position: "relative", maxWidth: "520px", margin: "56px 0" }}>
                    <h2 style={{ margin: 0, fontSize: "clamp(32px,3.4vw,52px)", lineHeight: 1.08, fontWeight: 800, color: "#fff", letterSpacing: "-.03em" }}>
                        The stalls stay open,
                        <span style={{ display: "block", color: "#fbbf24" }}>day and night.</span>
                    </h2>
                    <p style={{ marginTop: "20px", maxWidth: "440px", fontSize: "15px", lineHeight: 1.7, color: "rgba(203,213,225,.85)" }}>
                        Every seller you trust, every order you've placed, one gate to walk back through.
                    </p>

                    <ul style={{ listStyle: "none", margin: "36px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: "18px" }}>
                        {[
                            { icon: <FiTruck />, t: "Free delivery ₹499+", d: "12,000+ pin codes covered" },
                            { icon: <FiShield />, t: "Buyer protection", d: "7-day easy return & refund" },
                            { icon: <FiTag />, t: "Member-only deals", d: "Extra 10% off on first order" },
                        ].map((item) => (
                            <li key={item.t} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                                <span style={{
                                    height: "38px", width: "38px", flexShrink: 0, display: "grid", placeItems: "center",
                                    borderRadius: "12px", border: "1px solid rgba(255,255,255,.1)",
                                    background: "rgba(255,255,255,.05)", color: "#fb923c",
                                }}>
                                    {item.icon}
                                </span>
                                <span style={{ minWidth: 0 }}>
                                    <span style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#fff" }}>{item.t}</span>
                                    <span style={{ display: "block", fontSize: "12px", color: C.slate400 }}>{item.d}</span>
                                </span>
                            </li>
                        ))}
                    </ul>

                    <div style={{ marginTop: "32px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
                        {["ELECTRONICS", "FASHION", "HOME & LIVING", "GROCERY"].map((c) => (
                            <span key={c} style={{
                                borderRadius: "999px", border: "1px solid rgba(255,255,255,.12)",
                                background: "rgba(255,255,255,.04)", padding: "8px 16px",
                                fontSize: "11px", fontWeight: 600, letterSpacing: ".18em", color: "#cbd5e1",
                            }}>
                                {c}
                            </span>
                        ))}
                    </div>
                </div>

                <div style={{
                    position: "relative", display: "flex", alignItems: "center", gap: "10px",
                    borderTop: "1px solid rgba(255,255,255,.1)", paddingTop: "24px",
                    fontSize: "11px", fontWeight: 700, letterSpacing: ".22em", color: C.slate400,
                }}>
                    <span style={{ height: "8px", width: "8px", borderRadius: "999px", background: C.amber }} />
                    GATE · 24H ACCESS
                </div>
            </aside>

            {/* RIGHT : FORM PANEL */}
            <main style={st.right}>
                <div style={{ width: "100%", maxWidth: "440px" }}>
                    <div style={st.card}>

                        {/* tabs */}
                        {(type === "login" || type === "register") && (
                            <div style={{
                                display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px",
                                background: "#f1f5f9", padding: "4px", borderRadius: "14px", marginBottom: "24px",
                            }}>
                                {[{ key: "login", label: "Sign In" }, { key: "register", label: "Sign Up" }].map((tab) => (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        onClick={() => switchMode(tab.key)}
                                        style={{
                                            padding: "10px 12px", borderRadius: "10px", fontSize: "14px", fontWeight: 600,
                                            cursor: "pointer", transition: "all .2s",
                                            border: type === tab.key ? "1px solid #e2e8f0" : "1px solid transparent",
                                            background: type === tab.key ? "#fff" : "transparent",
                                            color: type === tab.key ? C.slate900 : C.slate500,
                                            boxShadow: type === tab.key ? "0 1px 2px rgba(15,23,42,.06)" : "none",
                                        }}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        <span style={{
                            display: "inline-block", borderRadius: "999px", background: "#fff7ed",
                            border: "1px solid #fed7aa", padding: "4px 12px", fontSize: "11px",
                            fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: C.orangeDark,
                        }}>
                            {heading[type].badge}
                        </span>

                        <h1 style={{ margin: "16px 0 0", fontSize: "30px", fontWeight: 800, letterSpacing: "-.025em", color: C.slate900 }}>
                            {heading[type].title}
                        </h1>
                        <p style={{ margin: "8px 0 0", fontSize: "14px", lineHeight: 1.6, color: C.slate500 }}>
                            {heading[type].description}
                        </p>

                        {error && <Alert tone="error">{error}</Alert>}
                        {(otpError || otpErrorLocal) && <Alert tone="error">{otpError || otpErrorLocal}</Alert>}
                        {otpVerified && <Alert tone="success">Email verified successfully</Alert>}

                        <form onSubmit={handleSubmit} style={{ marginTop: "26px" }}>
                            {/* Register  */}
                            {type === "register" && (
                                <>
                                    <div style={{ display: "grid", gridTemplateColumns: isWide ? "1fr 1fr" : "1fr", gap: "0 16px" }}>
                                        <Field label="First Name" name="firstName" value={formData.firstName}
                                            onChange={handleChange} onBlur={handleBlur} placeholder="John"
                                            icon={<FiUser />} error={touchedFields.firstName && formErrors.firstName}
                                            disabled={isOtpLocked} />
                                        <Field label="Last Name" name="lastName" value={formData.lastName}
                                            onChange={handleChange} onBlur={handleBlur} placeholder="Doe"
                                            icon={<FiUser />} error={touchedFields.lastName && formErrors.lastName}
                                            disabled={isOtpLocked} />
                                    </div>

                                    <Field label="Mobile Number" name="mobileNumber" type="tel" value={formData.mobileNumber}
                                        onChange={handleMobileChange} onBlur={handleBlur} placeholder="9876543210"
                                        icon={<FiPhone />} error={touchedFields.mobileNumber && formErrors.mobileNumber}
                                        disabled={isOtpLocked} />

                                    <Field label="Email address" name="email" type="email" value={formData.email}
                                        onChange={handleChange} onBlur={handleBlur} placeholder="name@company.com"
                                        icon={<FiMail />} error={touchedFields.email && formErrors.email}
                                        disabled={isOtpLocked} />

                                    <div style={st.field}>
                                        <PasswordField label="Password" name="password" value={formData.password}
                                            onChange={handleChange} onBlur={handleBlur}
                                            showPassword={showPassword} setShowPassword={setShowPassword}
                                            error={formErrors.password} disabled={isOtpLocked} noGap />
                                        {type === "register" && formData.password && (
                                            <div style={{ marginTop: "10px" }}>
                                                <div style={{ height: "6px", width: "100%", borderRadius: "999px", background: "#e2e8f0", overflow: "hidden" }}>
                                                    <div style={{ height: "100%", width: strength.width, background: strength.color, borderRadius: "999px", transition: "width .3s" }} />
                                                </div>
                                                <p style={{ margin: "6px 0 0", fontSize: "12px", color: C.slate500 }}>
                                                    Password strength: <span style={{ fontWeight: 700, color: C.slate700 }}>{strength.text}</span>
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <PasswordField label="Confirm Password" name="confirmPassword" value={formData.confirmPassword}
                                        onChange={handleChange} onBlur={handleBlur}
                                        showPassword={showConfirmPassword} setShowPassword={setShowConfirmPassword}
                                        error={formErrors.confirmPassword} disabled={isOtpLocked} />

                                    <label style={{
                                        display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer",
                                        borderRadius: "16px", border: `1px solid ${C.slate200}`, background: "#f8fafc",
                                        padding: "16px", marginBottom: "18px",
                                    }}>
                                        <input type="checkbox" name="termsAccepted" checked={formData.termsAccepted}
                                            onChange={handleChange}
                                            style={{ marginTop: "2px", height: "16px", width: "16px", flexShrink: 0, accentColor: C.orange }} />
                                        <span style={{ fontSize: "12px", lineHeight: 1.7, color: "#475569" }}>
                                            I agree to the{" "}
                                            <Link to="/terms" style={{ color: C.orangeDark, fontWeight: 700 }}>Terms of Sale</Link>{" and "}
                                            <Link to="/privacy" style={{ color: C.orangeDark, fontWeight: 700 }}>Privacy Policy</Link>, including order &amp; delivery communication.
                                            {formErrors.termsAccepted && (
                                                <span style={{ display: "block", marginTop: "4px", fontSize: "12px", fontWeight: 600, color: C.rose }}>
                                                    {formErrors.termsAccepted}
                                                </span>
                                            )}
                                        </span>
                                    </label>
                                </>
                            )}

                            {/* Login */}
                            {type === "login" && (
                                <>
                                    <Field label="Email address" name="email" type="email" value={formData.email}
                                        onChange={handleChange} onBlur={handleBlur} placeholder="name@company.com"
                                        icon={<FiMail />} error={touchedFields.email && formErrors.email} />

                                    <PasswordField label="Password" name="password" value={formData.password}
                                        onChange={handleChange} onBlur={handleBlur}
                                        showPassword={showPassword} setShowPassword={setShowPassword}
                                        error={formErrors.password}
                                        rightSlot={
                                            <Link to="/forgot-password" style={{ fontSize: "13px", fontWeight: 700, color: C.orangeDark }}>
                                                Forgot password?
                                            </Link>
                                        } />

                                    <p style={{ margin: "0 0 18px", fontSize: "12px", color: C.slate500 }}>
                                        Buyer &amp; seller — same login
                                    </p>
                                </>
                            )}

                            {/* Forgot Password */}
                            {type === "forgot" && (
                                <Field label="Email address" name="email" type="email" value={formData.email}
                                    onChange={handleChange} placeholder="name@company.com"
                                    icon={<FiMail />} error={formErrors.email} />
                            )}

                            {/* Reset password */}
                            {type === "reset" && (
                                <>
                                    <PasswordField
                                        label="New Password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        showPassword={showPassword}
                                        setShowPassword={setShowPassword}
                                        error={formErrors.password}
                                    />
                                    <PasswordField
                                        label="Confirm Password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        showPassword={showConfirmPassword}
                                        setShowPassword={setShowConfirmPassword}
                                        error={formErrors.confirmPassword}
                                    />
                                    <p style={{
                                        fontSize: '12px',
                                        color: '#64748b',
                                        marginBottom: '18px',
                                        textAlign: 'center'
                                    }}>
                                        ⏱️ This link will expire in 15 minutes
                                    </p>
                                </>
                            )}

                            {/* OTP */}
                            {otpSent && (
                                <div style={{
                                    borderRadius: "16px", border: `1px solid ${C.slate200}`, background: "#f8fafc",
                                    padding: "20px", marginBottom: "18px",
                                }}>
                                    <p style={{ margin: 0, textAlign: "center", fontSize: "14px", fontWeight: 700, color: "#1e293b" }}>
                                        Verify your email
                                    </p>
                                    <p style={{ margin: "4px 0 0", textAlign: "center", fontSize: "12px", color: C.slate500 }}>
                                        6-digit code {formData.email ? `sent to ${formData.email}` : "sent to your email"}
                                    </p>

                                    <div style={{ marginTop: "18px", display: "flex", justifyContent: "center", gap: "8px" }}>
                                        {otp.map((item, index) => (
                                            <input key={index} id={`otp-${index}`} value={item}
                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                maxLength="1" inputMode="numeric"
                                                onFocus={(e) => focusOn(e, false)} onBlur={(e) => focusOff(e, false)}
                                                style={{
                                                    height: "48px", width: "44px", textAlign: "center", fontSize: "18px",
                                                    fontWeight: 700, color: C.slate900, borderRadius: "12px",
                                                    border: `1px solid ${C.slate200}`, background: "#fff", outline: "none",
                                                }} />
                                        ))}
                                    </div>

                                    <button type="button" onClick={verifyOtp} disabled={otpLoading}
                                        style={{
                                            marginTop: "18px", width: "100%", padding: "12px", borderRadius: "12px",
                                            border: "none", background: C.slate900, color: "#fff",
                                            fontSize: "14px", fontWeight: 600, cursor: "pointer", opacity: otpLoading ? .6 : 1,
                                        }}>
                                        {otpLoading ? "Verifying..." : "Verify OTP"}
                                    </button>

                                    <div style={{ marginTop: "12px", textAlign: "center" }}>
                                        {canResend ? (
                                            <button type="button" onClick={onResendOtp} style={st.linkBtn}>Resend OTP</button>
                                        ) : (
                                            <span style={{ fontSize: "12px", color: C.slate500 }}>
                                                Resend code in <span style={{ fontWeight: 700, color: C.slate700 }}>{timer}s</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}


                            {/*  UPDATED SUBMIT BUTTON WITH LOADING SPINNER */}
                            {type === "login" ? (
                                <div style={{ display: "flex", gap: "10px" }}>

                                    <button type="submit" disabled={loading} style={st.primaryBtn(loading)}>

                                        {loading ? (
                                            <>
                                                <LoadingSpinner size="sm" color="white" text="" />
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                                {submitLabel[type]}
                                                <FiArrowRight />
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleClearFields}
                                        style={{
                                            padding: "14px 20px",
                                            borderRadius: "12px",
                                            border: "1px solid #e2e8f0",
                                            background: "#f8fafc",
                                            color: "#64748b",
                                            cursor: "pointer",
                                            fontSize: "15px",
                                            fontWeight: 600,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        Clear
                                    </button>
                                </div>
                            ) : (

                                // <button type="submit" disabled={loading} style={st.primaryBtn(loading)}>
                                //     {loading ? (
                                //         <>
                                //             <LoadingSpinner size="sm" color="white" text=""/>
                                //             <span>Processing...</span>
                                //         </>
                                //     ) : (
                                //         <>
                                //             {submitLabel[type]}
                                //             <FiArrowRight />
                                //         </>
                                //     )}
                                // </button>

                                <button
                                    type="submit"
                                    disabled={loading || (type === "register" && isOtpLocked)}
                                    style={st.primaryBtn(loading || (type === "register" && isOtpLocked))}
                                >
                                    {loading ? (
                                        <>
                                            <LoadingSpinner size="sm" color="white" text="" />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            {submitLabel[type]}
                                            <FiArrowRight />
                                        </>
                                    )}
                                </button>
                            )}
                        </form>

                        <p style={{ margin: "24px 0 0", textAlign: "center", fontSize: "14px", color: C.slate500 }}>
                            {footer[type].text}{" "}
                            <button
                                type="button"
                                onClick={() => {
                                    switchMode(footer[type].mode);
                                    setFormErrors({});
                                }}
                                style={st.linkBtn}
                            >
                                {footer[type].link}
                            </button>
                        </p>
                    </div>

                    <p style={{
                        margin: "20px 0 0", display: "flex", alignItems: "center", justifyContent: "center",
                        gap: "8px", fontSize: "11px", fontWeight: 600, letterSpacing: ".18em", color: C.slate400,
                    }}>
                        <FiShield /> GATE-ACCESS · SECURE SESSION
                    </p>
                </div>
            </main>

            <style>{`
                @media (max-width: 1023px) {
                    .auth-shell { flex-direction: column; }
                    .auth-left { display: none !important; }
                }
            `}</style>
        </div>
    );
};


//  SUB COMPONENTS

const Alert = ({ tone = "error", children }) => {
    const ok = tone === "success";
    return (
        <div style={{
            marginTop: "20px", display: "flex", alignItems: "flex-start", gap: "10px",
            borderRadius: "12px", padding: "12px 16px", fontSize: "14px", fontWeight: 500,
            border: `1px solid ${ok ? "#a7f3d0" : "#fecdd3"}`,
            background: ok ? "#ecfdf5" : "#fff1f2",
            color: ok ? "#047857" : "#be123c",
        }}>
            <span style={{ marginTop: "2px", flexShrink: 0, display: "flex" }}>
                {ok ? <FiCheck /> : <FiAlertCircle />}
            </span>
            <span style={{ lineHeight: 1.6 }}>{children}</span>
        </div>
    );
};

const Field = ({ label, name, type = "text", value, onChange, onBlur, placeholder, icon, error, disabled }) => (
    <div style={st.field}>
        <label htmlFor={name} style={st.label}>{label}</label>
        <div style={st.inputWrap}>
            <input
                id={name} name={name} type={type} value={value}
                onChange={onChange}
                onBlur={(e) => { focusOff(e, !!error); onBlur && onBlur(e); }}
                onFocus={(e) => focusOn(e, !!error)}
                placeholder={placeholder} disabled={disabled}
                style={{ ...st.input(!!error, false), ...(icon ? {} : { paddingLeft: "16px" }), ...(disabled ? { background: "#f1f5f9", color: C.slate400 } : {}) }}
            />
            {icon && <span style={st.iconLeft}>{icon}</span>}
        </div>
        {error && <p style={st.errText}><FiAlertCircle style={{ flexShrink: 0 }} />{error}</p>}
    </div>
);

const PasswordField = ({ label, name, value, onChange, onBlur, showPassword, setShowPassword, error, disabled, rightSlot, noGap }) => (
    <div style={noGap ? {} : st.field}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "6px" }}>
            <label htmlFor={name} style={{ ...st.label, marginBottom: 0 }}>{label}</label>
            {rightSlot}
        </div>
        <div style={st.inputWrap}>
            <input
                id={name} name={name} type={showPassword ? "text" : "password"} value={value}
                onChange={onChange}
                onBlur={(e) => { focusOff(e, !!error); onBlur && onBlur(e); }}
                onFocus={(e) => focusOn(e, !!error)}
                placeholder="Enter your password" disabled={disabled}
                style={{ ...st.input(!!error, true), ...(disabled ? { background: "#f1f5f9", color: C.slate400 } : {}) }}
            />
            <span style={st.iconLeft}><FiLock /></span>
            <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"} style={st.eyeBtn}>
                {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
        </div>
        {error && <p style={st.errText}><FiAlertCircle style={{ flexShrink: 0 }} />{error}</p>}
    </div>
);

export default AuthForm;