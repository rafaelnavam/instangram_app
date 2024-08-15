import React, { useState, useEffect } from "react";
// Importa React y dos hooks: useState para manejar el estado local y useEffect para ejecutar efectos secundarios.

import styles from "./ConfirEmail.module.css";
// Importa los estilos CSS del archivo correspondiente. styles contendrá un objeto con las clases CSS.

import { useNavigate, useLocation } from "react-router-dom";
// Importa dos hooks de react-router-dom: useNavigate para redirigir al usuario y useLocation para obtener la ubicación actual de la URL.

function useQuery() {
  return new URLSearchParams(useLocation().search);
  // Esta función personalizada utiliza useLocation para obtener la búsqueda actual de la URL (todo lo que viene después de "?").
  // Luego, crea y retorna un objeto URLSearchParams que permite acceder a los parámetros de la URL, como 'token'.
}

function ConfirmarEmail() {
  const [isConfirmed, setIsConfirmed] = useState(null);
  // Define un estado local isConfirmed que comienza como null. Este estado se usará para determinar si el email fue confirmado correctamente.

  const navigate = useNavigate();
  // Inicializa el hook useNavigate, que se utilizará para redirigir al usuario a otra ruta después de la confirmación.

  const query = useQuery();
  // Llama a la función useQuery para obtener los parámetros de la URL como un objeto URLSearchParams.

  const token = query.get('token');
  // Extrae el parámetro 'token' de la URL usando el método get() de URLSearchParams.

  useEffect(() => {
    // useEffect se usa aquí para ejecutar código cuando el componente se monta o cuando cambian ciertas dependencias.

    if (token) {
      // Verifica si el token está presente en la URL. Si no hay token, el efecto no se ejecuta.

      fetch(`${process.env.BACKEND_URL}/api/confirm/${token}`, { method: 'POST' })
        // Realiza una petición POST al endpoint de confirmación de email en el backend. 
        // Usa una plantilla de literales para construir la URL con el token.
        // process.env.BACKEND_URL se refiere a una variable de entorno que contiene la URL del backend.

        .then(response => response.json())
        // Cuando el servidor responde, convierte la respuesta a formato JSON.

        .then(data => {
          // El objeto JSON resultante se procesa aquí.

          if (data.confirm_email) {
            // Si la respuesta contiene confirm_email como true, significa que la confirmación fue exitosa.

            setIsConfirmed(true);
            // Actualiza el estado isConfirmed a true.

            setTimeout(() => {
              navigate('/');
              // Después de 2 segundos, redirige al usuario a la página principal usando navigate.
            }, 2000);

          } else {
            setIsConfirmed(false);
            // Si confirm_email es false, significa que la confirmación falló, así que actualiza el estado a false.
          }
        })

        .catch(error => {
          //console.error('Error al conectar al servidor:', error);
          // Si ocurre un error en cualquier parte del proceso de fetch, lo registra en la consola.

          setIsConfirmed(false);
          // También establece isConfirmed a false para indicar que la confirmación falló.
        });
    }
  }, [token, navigate]);
  // El array de dependencias [token, navigate] asegura que este efecto solo se ejecute cuando el token o la función navigate cambien.

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
// Exporta el componente ConfirmarEmail para que pueda ser utilizado en otros lugares de la aplicación.
