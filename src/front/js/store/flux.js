const getState = ({ getStore, getActions, setStore }) => {
  return {
    store: {
      users: [],
      user: {},

      isAuthenticated: null,
      uploadedUserData: [],
      isAuthenticatedMessage: null,
      loginError: [],
      dataRole: [],
      dataUser: {
        // Objeto que almacena los datos del usuario
        email: "", // Correo electrónico del usuario (inicializado como cadena vacía)
        name: "", // Nombre del usuario (inicializado como cadena vacía)
        last_name: "", // Apellido del usuario (inicializado como cadena vacía)
        username: "", // Nombre de usuario del usuario (inicializado como cadena vacía)
        password: "", // Contraseña del usuario (inicializada como cadena vacía)
      },
      creationState: null,
      createError: [],
    },
    actions: {
      validateToken: async (token) => {
        try {
          const url = `${process.env.BACKEND_URL}/api/validate-token`;

          const response = await fetch(url, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.user) {
              setStore({
                isAuthenticated: true,
                uploadedUserData: data.user, // Guarda los datos del usuario en el estado global
              });
              return { isAuthenticated: true };
            } else {
              console.error("Token inválido o usuario no encontrado");
              getActions().closeSession();
              return { isAuthenticated: false };
            }
          } else {
            console.error("Error validando el token", await response.text());
            getActions().closeSession();
            return { isAuthenticated: false };
          }
        } catch (error) {
          console.error("Error en la función validateToken:", error);
          getActions().closeSession();
          return { isAuthenticated: false };
        }
      },

      //---------------------------------------------------------FUNCION PARA LOGIN--------------------------------------------------------------------------

      loginUserV2: async (email, password) => {
        // Se define una función llamada handleLogin que se ejecutará al iniciar sesión

        if (email.trim() === "" || password.trim() === "") {
          // Verifica si el campo de email o contraseña están vacíos
          // console.error("Por favor completa todos los campos.");
          return; // Detener el proceso si algún campo está vacío
        }

        try {
          const url = `${process.env.BACKEND_URL}/api/token`;

          let response = await fetch(
            url, // URL del servidor
            {
              method: "POST", // Método de la solicitud
              headers: {
                "Content-Type": "application/json", // Tipo de contenido de la solicitud
              },
              body: JSON.stringify({ email, password }), // Datos del usuario convertidos a formato JSON y enviados en el cuerpo de la solicitud
            }
          );

          let data = await response.json(); // Se espera la respuesta del servidor en formato JSON
          // console.log(data)
          if (data.access_token) {
            // Si se recibe un token de acceso en la respuesta
            localStorage.setItem("token", data.access_token);
            localStorage.setItem("isAuthenticated", JSON.stringify(true));
            localStorage.setItem("user_id", data.user_id);

            let store = getStore();
            setStore({
              ...store,
              isAuthenticated: true,
              isAuthenticatedMessage: true,
              loginError: null,
            });
          } else if (data.error) {
            setStore({
              isAuthenticated: false,
              isAuthenticatedMessage: false,
              loginError: data.error,
            });
            // Ocultar el error después de 1.5 segundos
            setTimeout(() => {
              setStore({ ...getStore(), isAuthenticatedMessage: null }); // Se reinicia el estado relacionado con el login después de 3 segundos
              setStore({ ...getStore(), loginError: [] }); // Se reinicia el estado relacionado con el error después de 3 segundos
            }, 1500);
          }
          // console.log('data after setTimeout',data)
        } catch (error) {
          // console.error(error);
          throw new Error(`Error login: ${error.message}`); // Se maneja cualquier error que ocurra durante el proceso de inicio de sesión
        }
      },
      //-------------------------------FUNCION PARA CARGAR LOS DATOS DEL USARIO AL HACER LOGIN--------------------------------------------------------------------------

      loadUserData: async () => {
        // Se define una función llamada userDataHelp que se ejecutará para obtener datos de usuario con ayuda del token
        try {
          // Obtenemos el token del almacenamiento local
          let myToken = localStorage.getItem("token");

          // Construimos la URL para la solicitud
          const url = `${process.env.BACKEND_URL}/api/user`;

          // Realizamos una solicitud a la URL usando fetch, incluyendo el token de autorización en los encabezados
          let response = await fetch(url, {
            method: "GET", // Método de la solicitud
            headers: {
              Authorization: `Bearer ${myToken}`,
              // Se incluye el token de autorización en los encabezados concatenamos con el nombre del tipo de token "BearerToken"
            },
          });

          // Verificamos si la respuesta de la solicitud es exitosa (status code 200-299)
          if (!response.ok) {
            // Si la respuesta no es exitosa, lanzamos un error con un mensaje apropiado
            throw new Error(
              `No se pudieron recuperar los datos: ${response.statusText}`
            );
          }

          // Convertimos la respuesta a formato JSON para extraer los datos
          let data = await response.json();
          //	console.log(data)
          let store = getStore(); // Se obtiene el estado actual del almacén
          setStore({ ...store, uploadedUserData: data }); // Se actualiza el estado con los datos de usuario recuperados

          // Imprimimos el estado de la tienda después de cargar los datos (solo para depuración)
          // console.log("Store after data loaded:", store);
        } catch (error) {
          console.error(error); // Se imprime cualquier error que ocurra durante el proceso
          // Si ocurre algún error durante el proceso, lo capturamos y lo mostramos en la consola
        }
      },
      //---------------------------------------------------------FUNCION PARA CERRAR SESION--------------------------------------------------------------------------

      closeSession: () => {
        // Se define una función llamada closeSession que se utilizará para cerrar la sesión del usuario
        // Eliminar la información de inicio de sesión del almacenamiento local y restablecer los datos del usuario
        localStorage.removeItem("token");
        localStorage.removeItem("isAuthenticated");

        // Ocultar el error después de 1.5 segundos
        setTimeout(() => {
          setStore({
            ...getStore(), // Se mantiene el resto del estado sin cambios
            isAuthenticated: null,
            uploadedUserData: [],
            isAuthenticatedMessage: null,
            loginError: [],
          });
        }, 2000);

        // console.log(store); // Se imprime el estado actualizado en la consola (para propósitos de depuración)
      },
      //---------------------------------------------------------FUNCION PARA CREAR USER--------------------------------------------------------------------------
      createUser: async (dataUser) => {
        try {
          const url = `${process.env.BACKEND_URL}/api/singup/user`;

          let response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dataUser),
          });

          let data = await response.json();

          if (response.ok) {
            setStore({
              ...getStore(),
              creationState: { create: true, message: data.message },
            });
            return true; // Indica que la creación fue exitosa
          } else {
            setStore({
              ...getStore(),
              creationState: { create: false, error: data.error },
            });
            return false; // Indica que hubo un error
          }
        } catch (error) {
          // console.error("Registration Error:", error);
          setStore({
            ...getStore(),
            creationState: {
              create: false,
              error: "Registration failed due to an exception.",
            },
          });
          return false;
        }
      },
      //--------- creacion se usuario con google---------------------------------------
      checkIfUserExists: async (email) => {
        try {
          const url = `${process.env.BACKEND_URL}/api/user/exists`;
          let response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });

          let data = await response.json();
          return data.exists;
        } catch (error) {
          console.error("Error checking if user exists: ", error);
          return false;
        }
      },

      loginUserWithGoogle: async (email, googleId) => {
        try {
          const url = `${process.env.BACKEND_URL}/api/token`;
          let response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, googleId }),
          });

          let data = await response.json();
          if (data.access_token) {
            localStorage.setItem("token", data.access_token);
            localStorage.setItem("isAuthenticated", JSON.stringify(true));
            localStorage.setItem("user_id", data.user_id);

            let store = getStore();
            setStore({
              ...store,
              isAuthenticated: true,
              isAuthenticatedMessage: true,
              loginError: null,
              dataRole: data.role,
            });
            return true;
          } else {
            setStore({
              isAuthenticated: false,
              isAuthenticatedMessage: false,
              loginError: data.error,
              dataRole: null,
            });
            return false;
          }
        } catch (error) {
          throw new Error(`Error login: ${error.message}`);
        }
      },
      updateUserData: async (userData) => {
        // Obtenemos el token del almacenamiento local
        let myToken = localStorage.getItem("token");
        // console.log(myToken);
        console.log(userData);
        // Construimos la URL para la solicitud
        let url = `${process.env.BACKEND_URL}/api/user`;
        try {
          // Realizamos una solicitud a la URL usando fetch, incluyendo el token de autorización en los encabezados
          let response = await fetch(url, {
            method: "PUT", // Método de la solicitud
            headers: {
              Authorization: `Bearer ${myToken}`, // Se incluye el token de autorización en los encabezados concatenamos con el nombre del tipo de token "BearerToken"
              "Content-Type": "application/json", // Especifica que el cuerpo de la solicitud es JSON
            },
            body: JSON.stringify(userData),
          });
          let data = await response.json();
          console.log(data);
          if (response.ok) {
            // Asumiendo que quieres actualizar el store aquí
            return { success: true, data: data };
          } else {
            // Incluir la respuesta en la acción puede ayudar a manejar el estado más localmente
            return {
              success: false,
              error: data.error || "Unknown error occurred.",
            };
          }
        } catch (error) {
          console.error("Error al actualizar los datos:", error);
          return { success: false, error: error.message };
        }
      },

      //---------------------------------------------------------FUNCION PARA DESACTIVAR CUENTA DE USUARIO--------------------------------------------------------------------------

      updateUserActivation: async (userId, isActive) => {
        const token = localStorage.getItem("token");
        const url = `${process.env.BACKEND_URL}/api/user/${userId}/activate`;
        try {
          const response = await fetch(url, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ is_active: isActive }),
          });
          const data = await response.json();
          console.log(data);

          if (response.ok) {
            return { success: true, data: data };
          } else {
            return {
              success: false,
              error: data.error || "Unknown error occurred.",
            };
          }
        } catch (error) {
          console.error("Error updating user activation status:", error);
          return { success: false, error: error.message };
        }
      },
      //---------------------------------------------------------FUNCIONES PARA CARGAR FOTO DE PERFIL USER--------------------------------------------------------------------------
      // Función para cargar la foto de perfil
      uploadProfileImage: async (formData) => {
        // Obtener el token de autenticación del almacenamiento local
        const myToken = localStorage.getItem("token");
        // Construir la URL del endpoint para cargar la imagen de perfil
        const url = `${process.env.BACKEND_URL}/api/upload_img_profile`;

        try {
          // Realizar una solicitud POST al endpoint de carga de imagen
          const response = await fetch(url, {
            method: "POST", // Especificar el método HTTP como POST
            headers: {
              Authorization: `Bearer ${myToken}`, // Incluir el token de autenticación en los encabezados
            },
            body: formData, // Incluir el formulario de datos en el cuerpo de la solicitud
          });
          // Analizar la respuesta JSON
          const data = await response.json();
          // Verificar si la solicitud fue exitosa
          if (response.ok) {
            return { success: true, message: data.message }; // Retornar un objeto con éxito y el mensaje de la respuesta
          } else {
            return { success: false, message: data.error }; // Retornar un objeto con éxito falso y el error de la respuesta
          }
        } catch (error) {
          return { success: false, message: error.message }; // Retornar un objeto con éxito falso y el mensaje de error
        }
      },

      // Función para actualizar la foto de perfil
      updateProfileImage: async (formData) => {
        // Obtener el token de autenticación del almacenamiento local
        const myToken = localStorage.getItem("token");
        // Construir la URL del endpoint para actualizar la imagen de perfil
        const url = `${process.env.BACKEND_URL}/api/update_profile_image`;

        try {
          // Realizar una solicitud PUT al endpoint de actualización de imagen
          const response = await fetch(url, {
            method: "PUT", // Especificar el método HTTP como PUT
            headers: {
              Authorization: `Bearer ${myToken}`, // Incluir el token de autenticación en los encabezados
            },
            body: formData, // Incluir el formulario de datos en el cuerpo de la solicitud
          });
          // Analizar la respuesta JSON
          const data = await response.json();
          // Verificar si la solicitud fue exitosa
          if (response.ok) {
            return { success: true, message: data.message }; // Retornar un objeto con éxito y el mensaje de la respuesta
          } else {
            return { success: false, message: data.error }; // Retornar un objeto con éxito falso y el error de la respuesta
          }
        } catch (error) {
          return { success: false, message: error.message }; // Retornar un objeto con éxito falso y el mensaje de error
        }
      },

      // Función para eliminar la foto de perfil
      deleteProfileImage: async () => {
        // Obtener el token de autenticación del almacenamiento local
        const myToken = localStorage.getItem("token");
        // Construir la URL del endpoint para eliminar la imagen de perfil
        const url = `${process.env.BACKEND_URL}/api/delete_profile_image`;

        try {
          // Realizar una solicitud DELETE al endpoint de eliminación de imagen
          const response = await fetch(url, {
            method: "DELETE", // Especificar el método HTTP como DELETE
            headers: {
              Authorization: `Bearer ${myToken}`, // Incluir el token de autenticación en los encabezados
            },
          });
          // Analizar la respuesta JSON
          const data = await response.json();
          // Verificar si la solicitud fue exitosa
          if (response.ok) {
            return { success: true, message: data.message }; // Retornar un objeto con éxito y el mensaje de la respuesta
          } else {
            return { success: false, message: data.error }; // Retornar un objeto con éxito falso y el error de la respuesta
          }
        } catch (error) {
          return { success: false, message: error.message }; // Retornar un objeto con éxito falso y el mensaje de error
        }
      },
    },
  };
};

export default getState;
