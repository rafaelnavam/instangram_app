import React, { useState, useEffect } from "react";
import styles from "./ConfirEmail.module.css";
import { useNavigate, useLocation } from "react-router-dom";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function ConfirmarEmail() {
  const [isConfirmed, setIsConfirmed] = useState(null);
  const navigate = useNavigate();
  const query = useQuery();
  const token = query.get('token');

  useEffect(() => {
    console.log("ConfirmarEmail component mounted");

    if (token) {
      fetch(`${process.env.BACKEND_URL}/api/confirm/${token}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
          if (data.confirm_email) {
            setIsConfirmed(true);
            setTimeout(() => {
              navigate('/');
            }, 2000);
          } else {
            setIsConfirmed(false);
          }
        })
        .catch(error => {
          console.error('Error al conectar al servidor:', error);
          setIsConfirmed(false);
        });
    }
  }, [token, navigate]);

  return (
    <div className={styles.confirmationBox}>
      <h1 className={styles.confirmationHeading}>Confirming your email...</h1>
      {isConfirmed !== null && (
        isConfirmed ? (
          <p className={styles.confirmationSuccess}><i className="fa-solid fa-circle-check"></i> Your email has been confirmed</p>
        ) : (
          <p className={styles.confirmationError}><i className="fa-solid fa-circle-exclamation"></i> Oops! Something went wrong</p>
        )
      )}
    </div>
  );
}

export default ConfirmarEmail;
