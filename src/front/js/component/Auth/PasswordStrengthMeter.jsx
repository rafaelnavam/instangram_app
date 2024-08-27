// src/components/PasswordStrengthMeter.jsx
import React, { useState } from 'react'; // Importa React y useState de la biblioteca 'react'. useState es un hook que permite agregar estado a los componentes funcionales.
import PropTypes from 'prop-types'; // Importa PropTypes para definir las propiedades que el componente espera recibir.
import styles from './PasswordStrengthMeter.module.css'; // Importa los estilos específicos para este componente desde el archivo CSS.

const PasswordStrengthMeter = ({ password }) => { // Define un componente funcional llamado PasswordStrengthMeter que recibe 'password' como una prop.
    const [strength, setStrength] = useState(0); // Declara una variable de estado 'strength' inicializada en 0 y una función 'setStrength' para actualizarla.

    // Función que evalúa la fuerza de la contraseña.
    const evaluatePasswordStrength = (password) => {
        let strength = 0; // Inicializa la variable 'strength' en 0.

        // Arreglo de expresiones regulares para evaluar diferentes aspectos de la contraseña.
        const regexes = [
            /[a-z]/, // Comprueba si hay al menos una letra minúscula.
            /[A-Z]/, // Comprueba si hay al menos una letra mayúscula.
            /[0-9]/, // Comprueba si hay al menos un número.
            /[@#$%^&+=*!]/ // Comprueba si hay al menos un carácter especial.
        ];

        // Itera sobre cada expresión regular en el arreglo.
        regexes.forEach((regex) => {
            if (regex.test(password)) { // Si la contraseña cumple con la expresión regular.
                strength += 1; // Incrementa la fuerza en 1 por cada condición cumplida.
            }
        });

        if (password.length >= 8) { // Si la longitud de la contraseña es de al menos 8 caracteres.
            strength += 1; // Incrementa la fuerza en 1.
        }

        setStrength(strength); // Actualiza la variable de estado 'strength' con el valor calculado.
    };

    // Función que retorna el color asociado a la fuerza de la contraseña.
    const getStrengthColor = () => {
        switch (strength) { // Evalúa el valor de 'strength'.
            case 1: return 'red'; // Fuerza muy baja, color rojo.
            case 2: return 'orange'; // Fuerza baja, color naranja.
            case 3: return 'yellow'; // Fuerza media, color amarillo.
            case 4: return 'lightgreen'; // Fuerza buena, color verde claro.
            case 5: return 'green'; // Fuerza excelente, color verde.
            default: return 'gray'; // Valor por defecto, fuerza desconocida, color gris.
        }
    };

    // Arreglo de recomendaciones basado en expresiones regulares.
    const recommendations = [
        { regex: /[a-z]/, message: "Añadir al menos una minúscula." }, // Recomendación para añadir al menos una letra minúscula.
        { regex: /[A-Z]/, message: "Añadir al menos una mayúscula." }, // Recomendación para añadir al menos una letra mayúscula.
        { regex: /[0-9]/, message: "Añadir al menos un número." }, // Recomendación para añadir al menos un número.
        { regex: /[@#$%^&+=*!]/, message: "Añadir al menos un carácter especial." }, // Recomendación para añadir al menos un carácter especial.
        { regex: /.{8,}/, message: "La contraseña debe tener al menos 8 caracteres." } // Recomendación para que la contraseña tenga al menos 8 caracteres.
    ];

    // Hook de efecto que se ejecuta cada vez que la prop 'password' cambia.
    React.useEffect(() => {
        evaluatePasswordStrength(password); // Llama a la función para evaluar la fuerza de la contraseña.
    }, [password]); // Solo se ejecuta cuando la contraseña cambia.

    return ( // Renderiza el componente.
        <div>
            <div className={styles.strengthBarContainer}> {/* Contenedor de la barra de fuerza */}
                <div
                    className={styles.strengthBar} // Aplica estilos CSS a la barra de fuerza.
                    style={{
                        width: `${(strength / 5) * 100}%`, // Calcula el ancho de la barra basado en la fuerza de la contraseña.
                        backgroundColor: getStrengthColor(), // Aplica el color correspondiente a la fuerza de la contraseña.
                    }}
                />
            </div>
            <ul className={styles.recommendations}> {/* Lista de recomendaciones */}
                {recommendations.map((rec, index) => !rec.regex.test(password) && ( // Mapea las recomendaciones y muestra solo aquellas que la contraseña no cumple.
                    <li key={index}>{rec.message}</li> // Muestra el mensaje de la recomendación.
                ))}
            </ul>
        </div>
    );
};

PasswordStrengthMeter.propTypes = { // Define las propTypes para este componente.
    password: PropTypes.string.isRequired, // Especifica que la prop 'password' es obligatoria y debe ser una cadena.
};

export default PasswordStrengthMeter; // Exporta el componente para que pueda ser utilizado en otros archivos.
