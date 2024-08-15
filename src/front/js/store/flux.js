const getState = ({ getStore, getActions, setStore }) => {
  return {
    store: {
      users: [],
      user: {},

      isAuthenticated: null,
      uploadedUserData: [],
      isAuthenticatedMessage: null,
      loginError: [],
      dataUser: {
        email: "",
        name: "",
        last_name: "",
        username: "",
        password: "",
      },
      creationState: null,
      createError: [],

      posts: [],
      allposts: [],
      searchResults: [],
    },
    actions: {
      validateToken: async (token) => {
        try {
          const url = `${process.env.BACKEND_URL}/api/validate-token`; // Construye la URL para la API que valida el token.

          const response = await fetch(url, {
            // Realiza una solicitud HTTP a la API.
            method: "GET", // Especifica el método HTTP como GET.
            headers: {
              Authorization: `Bearer ${token}`, // Incluye el token JWT en la cabecera de autorización.
            },
          });

          if (response.ok) {
            // Verifica si la respuesta HTTP fue exitosa (código 200-299).
            const data = await response.json(); // Convierte la respuesta en formato JSON.
            if (data.user) {
              // Comprueba si los datos del usuario están presentes en la respuesta.
              setStore({
                isAuthenticated: true, // Actualiza el estado global para indicar que el usuario está autenticado.
                uploadedUserData: data.user, // Guarda los datos del usuario en el estado global.
              });
              return { isAuthenticated: true }; // Retorna un objeto indicando que la autenticación fue exitosa.
            } else {
              console.error("Token inválido o usuario no encontrado"); // Muestra un error si el token es inválido o el usuario no fue encontrado.
              getActions().closeSession(); // Llama a la función para cerrar la sesión del usuario.
              return { isAuthenticated: false }; // Retorna un objeto indicando que la autenticación falló.
            }
          } else {
            console.error("Error validando el token", await response.text()); // Muestra un error si la validación del token falla.
            getActions().closeSession(); // Llama a la función para cerrar la sesión del usuario.
            return { isAuthenticated: false }; // Retorna un objeto indicando que la autenticación falló.
          }
        } catch (error) {
          console.error("Error en la función validateToken:", error); // Muestra un error si ocurre una excepción durante la ejecución de la función.
          getActions().closeSession(); // Llama a la función para cerrar la sesión del usuario.
          return { isAuthenticated: false }; // Retorna un objeto indicando que la autenticación falló.
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
          // console.log(data)
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
        // Define una función asíncrona para crear un nuevo usuario.
        try {
          const url = `${process.env.BACKEND_URL}/api/singup/user`; // Construye la URL para la API que maneja el registro de usuarios.

          let response = await fetch(url, {
            // Realiza una solicitud HTTP POST a la API.
            method: "POST", // Especifica el método HTTP como POST.
            headers: { "Content-Type": "application/json" }, // Define el tipo de contenido de la solicitud como JSON.
            body: JSON.stringify(dataUser), // Convierte los datos del usuario a una cadena JSON y los incluye en el cuerpo de la solicitud.
          });

          let data = await response.json(); // Convierte la respuesta de la API a formato JSON.

          if (response.ok) {
            // Comprueba si la respuesta HTTP indica éxito (código 200-299).
            setStore({
              ...getStore(), // Mantiene el estado actual del store.
              creationState: { create: true, message: data.message }, // Actualiza el estado indicando que la creación fue exitosa y guarda el mensaje de la API.
            });
            return true; // Retorna true para indicar que la creación del usuario fue exitosa.
          } else {
            setStore({
              ...getStore(), // Mantiene el estado actual del store.
              creationState: { create: false, error: data.error }, // Actualiza el estado indicando que hubo un error en la creación y guarda el mensaje de error.
            });
            return false; // Retorna false para indicar que hubo un error en la creación del usuario.
          }
        } catch (error) {
          setStore({
            ...getStore(), // Mantiene el estado actual del store.
            creationState: {
              create: false, // Indica que la creación falló debido a una excepción.
              error: "Registration failed due to an exception.", // Establece un mensaje de error genérico.
            },
          });
          return false; // Retorna false para indicar que hubo un error en la creación del usuario.
        }
      },

      //--------- creacion se usuario con google--------------------------------------------------------------------------------------------------------------------------------

      checkIfUserExists: async (email) => {
        // Define una función asíncrona para verificar si un usuario existe basado en su email.
        try {
          const url = `${process.env.BACKEND_URL}/api/user/exists`; // Construye la URL para la API que verifica la existencia de un usuario.
          let response = await fetch(url, {
            // Realiza una solicitud HTTP POST a la API.
            method: "POST", // Especifica el método HTTP como POST.
            headers: { "Content-Type": "application/json" }, // Define el tipo de contenido de la solicitud como JSON.
            body: JSON.stringify({ email }), // Convierte el email a una cadena JSON y lo incluye en el cuerpo de la solicitud.
          });

          let data = await response.json(); // Convierte la respuesta de la API a formato JSON.
          return data.exists; // Retorna un valor booleano indicando si el usuario existe.
        } catch (error) {
          console.error("Error checking if user exists: ", error); // Muestra un error en caso de que ocurra durante la ejecución de la función.
          return false; // Retorna false si ocurre un error, indicando que no se pudo verificar la existencia del usuario.
        }
      },
      //--------- login de usuario con google--------------------------------------------------------------------------------------------------------------------------------

      loginUserWithGoogle: async (email, googleId) => {
        // Define una función asíncrona para iniciar sesión de un usuario utilizando Google.
        try {
          const url = `${process.env.BACKEND_URL}/api/token`; // Construye la URL para la API que maneja la autenticación del usuario.
          let response = await fetch(url, {
            // Realiza una solicitud HTTP POST a la API.
            method: "POST", // Especifica el método HTTP como POST.
            headers: {
              "Content-Type": "application/json", // Define el tipo de contenido de la solicitud como JSON.
            },
            body: JSON.stringify({ email, googleId }), // Convierte el email y googleId a una cadena JSON y lo incluye en el cuerpo de la solicitud.
          });

          let data = await response.json(); // Convierte la respuesta de la API a formato JSON.
          if (data.access_token) {
            // Comprueba si la respuesta contiene un token de acceso.
            localStorage.setItem("token", data.access_token); // Guarda el token de acceso en el almacenamiento local.
            localStorage.setItem("isAuthenticated", JSON.stringify(true)); // Guarda el estado de autenticación en el almacenamiento local.
            localStorage.setItem("user_id", data.user_id); // Guarda el ID del usuario en el almacenamiento local.

            let store = getStore(); // Obtiene el estado global actual.
            setStore({
              ...store, // Mantiene el estado actual del store.
              isAuthenticated: true, // Actualiza el estado indicando que el usuario está autenticado.
              isAuthenticatedMessage: true, // Establece un mensaje indicando autenticación exitosa.
              loginError: null, // Borra cualquier error de inicio de sesión anterior.
              dataRole: data.role, // Guarda el rol del usuario en el estado.
            });
            return true; // Retorna true para indicar que la autenticación fue exitosa.
          } else {
            setStore({
              isAuthenticated: false, // Actualiza el estado indicando que el usuario no está autenticado.
              isAuthenticatedMessage: false, // Establece un mensaje indicando que la autenticación falló.
              loginError: data.error, // Guarda el mensaje de error en el estado.
              dataRole: null, // Limpia cualquier rol de usuario previo.
            });
            return false; // Retorna false para indicar que la autenticación falló.
          }
        } catch (error) {
          throw new Error(`Error login: ${error.message}`); // Lanza una excepción si ocurre un error durante la ejecución de la función.
        }
      },

      //--------- edicion de usuario--------------------------------------------------------------------------------------------------------------------------------

      updateUserData: async (userData) => {
        // Obtenemos el token del almacenamiento local
        let myToken = localStorage.getItem("token");
        // console.log(myToken);
        // console.log(userData);
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
          // console.log(data);
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
        // Define una función asíncrona para actualizar el estado de activación de un usuario.
        const token = localStorage.getItem("token"); // Recupera el token JWT almacenado localmente.
        const url = `${process.env.BACKEND_URL}/api/user/${userId}/activate`; // Construye la URL para la API que maneja la activación/desactivación del usuario.
        try {
          const response = await fetch(url, {
            // Realiza una solicitud HTTP PUT a la API.
            method: "PUT", // Especifica el método HTTP como PUT.
            headers: {
              Authorization: `Bearer ${token}`, // Incluye el token JWT en la cabecera de autorización.
              "Content-Type": "application/json", // Define el tipo de contenido de la solicitud como JSON.
            },
            body: JSON.stringify({ is_active: isActive }), // Convierte el estado de activación a una cadena JSON y lo incluye en el cuerpo de la solicitud.
          });
          const data = await response.json(); // Convierte la respuesta de la API a formato JSON.

          if (response.ok) {
            // Comprueba si la respuesta HTTP indica éxito (código 200-299).
            return { success: true, data: data }; // Retorna un objeto indicando que la actualización fue exitosa, junto con los datos de la respuesta.
          } else {
            return {
              success: false, // Indica que la actualización falló.
              error: data.error || "Unknown error occurred.", // Retorna un mensaje de error, usando el error de la API si está disponible o un mensaje genérico.
            };
          }
        } catch (error) {
          console.error("Error updating user activation status:", error); // Muestra un error si ocurre durante la ejecución de la función.
          return { success: false, error: error.message }; // Retorna un objeto indicando que la actualización falló debido a una excepción.
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

      //---------------------------------------------------------FUNCION PARA LA GESTION DE POSTS--------------------------------------------------------------------------

      // función asíncrona para crear una nueva publicación.
      createPost: async (postData) => {
        try {
          const token = localStorage.getItem("token"); // Recupera el token JWT almacenado localmente.
          const response = await fetch(`${process.env.BACKEND_URL}/api/posts`, {
            // Realiza una solicitud HTTP POST a la API.
            method: "POST", // Especifica el método HTTP como POST.
            headers: {
              Authorization: `Bearer ${token}`, // Incluye el token JWT en la cabecera de autorización.
            },
            body: postData, // Envía los datos de la publicación en el cuerpo de la solicitud, no se usa JSON.stringify porque se está manejando un FormData.
          });
          const data = await response.json(); // Convierte la respuesta de la API a formato JSON.
          if (response.ok) {
            // Comprueba si la respuesta HTTP indica éxito (código 200-299).
            return { success: true, post: data.post }; // Retorna un objeto indicando que la creación fue exitosa y devuelve los datos de la publicación.
          } else {
            return { success: false, error: data.error }; // Retorna un objeto indicando que la creación falló y devuelve el mensaje de error.
          }
        } catch (error) {
          return { success: false, error: error.message }; // Maneja cualquier excepción que ocurra y retorna un objeto indicando el error.
        }
      },

      // función asíncrona para editar una publicación existente.
      editPost: async (postId, postData) => {
        try {
          const token = localStorage.getItem("token"); // Recupera el token JWT almacenado localmente.
          const response = await fetch(
            `${process.env.BACKEND_URL}/api/posts/${postId}`,
            {
              // Realiza una solicitud HTTP PUT a la API para editar la publicación.
              method: "PUT", // Especifica el método HTTP como PUT.
              headers: {
                Authorization: `Bearer ${token}`, // Incluye el token JWT en la cabecera de autorización.
              },
              body: postData, // Envía los datos de la publicación en el cuerpo de la solicitud, no se usa JSON.stringify porque se está manejando un FormData.
            }
          );
          const data = await response.json(); // Convierte la respuesta de la API a formato JSON.
          if (response.ok) {
            // Comprueba si la respuesta HTTP indica éxito (código 200-299).
            return { success: true, post: data.post }; // Retorna un objeto indicando que la edición fue exitosa y devuelve los datos de la publicación.
          } else {
            return { success: false, error: data.error }; // Retorna un objeto indicando que la edición falló y devuelve el mensaje de error.
          }
        } catch (error) {
          return { success: false, error: error.message }; // Maneja cualquier excepción que ocurra y retorna un objeto indicando el error.
        }
      },

      // función asíncrona para eliminar una publicación existente.
      deletePost: async (postId) => {
        try {
          const token = localStorage.getItem("token"); // Recupera el token JWT almacenado localmente.
          const response = await fetch(
            `${process.env.BACKEND_URL}/api/posts/${postId}`,
            {
              // Realiza una solicitud HTTP DELETE a la API para eliminar la publicación.
              method: "DELETE", // Especifica el método HTTP como DELETE.
              headers: {
                Authorization: `Bearer ${token}`, // Incluye el token JWT en la cabecera de autorización.
              },
            }
          );
          const data = await response.json(); // Convierte la respuesta de la API a formato JSON.
          if (response.ok) {
            // Comprueba si la respuesta HTTP indica éxito (código 200-299).
            return { success: true, message: data.message }; // Retorna un objeto indicando que la eliminación fue exitosa y devuelve un mensaje de confirmación.
          } else {
            return { success: false, error: data.error }; // Retorna un objeto indicando que la eliminación falló y devuelve el mensaje de error.
          }
        } catch (error) {
          return { success: false, error: error.message }; // Maneja cualquier excepción que ocurra y retorna un objeto indicando el error.
        }
      },

      // función asíncrona para obtener las publicaciones del usuario autenticado.
      getUserPosts: async () => {
        try {
          const token = localStorage.getItem("token"); // Recupera el token JWT almacenado localmente.
          const response = await fetch(
            `${process.env.BACKEND_URL}/api/user/posts`,
            {
              // Realiza una solicitud HTTP GET a la API para obtener las publicaciones del usuario.
              method: "GET", // Especifica el método HTTP como GET.
              headers: {
                Authorization: `Bearer ${token}`, // Incluye el token JWT en la cabecera de autorización.
              },
            }
          );
          const data = await response.json(); // Convierte la respuesta de la API a formato JSON.
          if (response.ok) {
            // Comprueba si la respuesta HTTP indica éxito (código 200-299).
            setStore({ posts: data }); // Almacena las publicaciones en el estado global.
            return { success: true, posts: data }; // Retorna un objeto indicando éxito y las publicaciones obtenidas.
          } else {
            return { success: false, error: data.error }; // Retorna un objeto indicando fallo y el mensaje de error.
          }
        } catch (error) {
          return { success: false, error: error.message }; // Maneja cualquier excepción que ocurra y retorna un objeto indicando el error.
        }
      },

      // función asíncrona para obtener todas las publicaciones.
      getAllPosts: async () => {
        try {
          const token = localStorage.getItem("token"); // Recupera el token JWT almacenado localmente.
          const response = await fetch(
            `${process.env.BACKEND_URL}/api/allposts`,
            {
              // Realiza una solicitud HTTP GET a la API para obtener todas las publicaciones.
              method: "GET", // Especifica el método HTTP como GET.
              headers: {
                Authorization: `Bearer ${token}`, // Incluye el token JWT en la cabecera de autorización.
              },
            }
          );
          const data = await response.json(); // Convierte la respuesta de la API a formato JSON.
          if (response.ok) {
            // Comprueba si la respuesta HTTP indica éxito (código 200-299).
            setStore({ allposts: data }); // Almacena todas las publicaciones en el estado global.
            return { success: true, posts: data }; // Retorna un objeto indicando éxito y las publicaciones obtenidas.
          } else {
            return { success: false, error: data.error }; // Retorna un objeto indicando fallo y el mensaje de error.
          }
        } catch (error) {
          return { success: false, error: error.message }; // Maneja cualquier excepción que ocurra y retorna un objeto indicando el error.
        }
      },

      //---------------------------------------------------------FUNCION PARA LOS LIKES--------------------------------------------------------------------------

      // función asíncrona para alternar el like de una publicación.
      toggleLike: async (postId) => {
        try {
          const token = localStorage.getItem("token"); // Recupera el token JWT almacenado localmente.
          const response = await fetch(
            `${process.env.BACKEND_URL}/api/post/${postId}/like`,
            {
              // Realiza una solicitud HTTP POST a la API para dar o quitar like a una publicación.
              method: "POST", // Especifica el método HTTP como POST.
              headers: {
                Authorization: `Bearer ${token}`, // Incluye el token JWT en la cabecera de autorización.
                "Content-Type": "application/json", // Define el tipo de contenido de la solicitud como JSON.
              },
            }
          );
          const data = await response.json(); // Convierte la respuesta de la API a formato JSON.
          if (response.ok) {
            // Comprueba si la respuesta HTTP indica éxito (código 200-299).
            return {
              success: true, // Indica que la operación fue exitosa.
              liked_by_user: data.liked_by_user, // Lista de IDs de los usuarios que han dado like.
              likes_count: data.likes_count, // Número total de likes.
              message: data.message, // Mensaje de confirmación.
            };
          } else {
            return { success: false, error: data.error }; // Retorna un objeto indicando fallo y el mensaje de error.
          }
        } catch (error) {
          return { success: false, error: error.message }; // Maneja cualquier excepción que ocurra y retorna un objeto indicando el error.
        }
      },

      //---------------------------------------------------------FUNCIONES PARA BUSCAR PERFILES--------------------------------------------------------------------------

      // función asíncrona para obtener el perfil de otro usuario por su nombre de usuario.
      getOtherUserProfile: async (username) => {
        try {
          const token = localStorage.getItem("token"); // Recupera el token JWT almacenado localmente.
          const response = await fetch(
            `${process.env.BACKEND_URL}/api/user/profile/${username}`,
            {
              // Realiza una solicitud HTTP GET a la API para obtener el perfil de otro usuario.
              method: "GET", // Especifica el método HTTP como GET.
              headers: {
                Authorization: `Bearer ${token}`, // Incluye el token JWT en la cabecera de autorización.
                "Content-Type": "application/json", // Define el tipo de contenido de la solicitud como JSON.
              },
            }
          );
          const data = await response.json(); // Convierte la respuesta de la API a formato JSON.
          if (response.ok) {
            // Comprueba si la respuesta HTTP indica éxito (código 200-299).
            return { success: true, user: data.user, posts: data.posts }; // Retorna un objeto indicando éxito, el perfil del usuario y sus publicaciones.
          } else {
            return { success: false, error: data.error }; // Retorna un objeto indicando fallo y el mensaje de error.
          }
        } catch (error) {
          return { success: false, error: error.message }; // Maneja cualquier excepción que ocurra y retorna un objeto indicando el error.
        }
      },

      // función asíncrona para buscar usuarios por un término de búsqueda.
      searchUsers: async (query) => {
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/api/users/search?query=${query}`,
            {
              // Realiza una solicitud HTTP GET a la API para buscar usuarios.
              method: "GET", // Especifica el método HTTP como GET.
              headers: {
                "Content-Type": "application/json", // Define el tipo de contenido de la solicitud como JSON.
              },
            }
          );
          if (!response.ok) throw new Error("Failed to fetch users"); // Lanza un error si la respuesta no es exitosa.
          const data = await response.json(); // Convierte la respuesta de la API a formato JSON.
          setStore({ searchResults: data }); // Almacena los resultados de la búsqueda en el estado global.
        } catch (error) {
          console.error("Error searching users:", error); // Muestra un error si ocurre durante la ejecución de la función.
        }
      },
    },
  };
};

export default getState;
