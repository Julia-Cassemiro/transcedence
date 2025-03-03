import React, { useEffect, useState } from "react";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import { Link } from "react-router-dom"; // Importe Link para navegar entre as páginas
import axios from "axios";

export const Home = () => {
  interface UserData {
    user: string;
	nickname: string;
    email: string;
    profileImage: string;
  }

  const defaultPhoto = "https://i.imgur.com/VavB8Rm.png";

  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [editedNickname, setEditedNickname] = useState("");
  const [isProfileSectionVisible, setIsProfileSectionVisible] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedName(userData?.user || "");
    setEditedEmail(userData?.email || "");
    setEditedNickname(userData?.nickname || "");
  };

  const handleSaveClick = async () => {
    try {
      const IdData = await axiosPrivate.get("/user/me");
      const userId = IdData.data.userId;

      const newData = {
        userId: userId,
        user: editedName,
        email: editedEmail,
		nickname: editedNickname
      };

      const userResponse = await axiosPrivate.patch(
        "/user/updateProfile",
        newData
      );

      setUserData({
        user: userResponse.data.user.user,
        email: userResponse.data.user.email,
		nickname: userResponse.data.user.nickname,
        profileImage: userResponse.data?.profileImage,
      });
      // Saia do modo de edição
      setIsEditing(false);
      // Alterne a visibilidade das seções
      setIsProfileSectionVisible(!isProfileSectionVisible);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error("Mensagem de erro:", error.response.data.message);
        setErrorMessage(error.response.data.message);
      }
    }
  };

  const [showBall, setShowBall] = useState(false);
  const [username, setUserName] = useState("");
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const user = async () => {
      try {
        const response = await axiosPrivate.get("/user/me");
        setUserName(response.data?.user?.toUpperCase() + ",");
        return response.data;
      } catch (error) {
        console.log(error);
        window.location.href = "http://localhost:3000/Login";
      }
    };
    user();
  }, [axiosPrivate]);

  useEffect(() => {
    // Mostrar a bola após 2 segundos (pode ajustar o tempo)
    const timeout = setTimeout(() => {
      setShowBall(true);
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);
  let image = "";
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosPrivate.get("/user/me");
        setUserData({
          user: response.data?.user,
          email: response.data?.email,
		  nickname: response.data?.nickname,
          profileImage: response.data?.profileImage,
        });
        image = response.data?.profileImage;
      } catch (error) {
        console.log(error);
      }
    };

    fetchUserData();
  }, [axiosPrivate, setUserData]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Obter dados do usuário
        const userResponse = await axiosPrivate.get("/user/me");
        const userData = userResponse.data;

        // Extrair o valor do usuário retornado
        const user = userData.user;

        // Realizar o upload da imagem com o valor do usuário
        const formData = new FormData();
        formData.append("profileImage", file); // 'file' é o arquivo de imagem
        formData.append("user", user); // Adicionar o usuário ao FormData

        // Enviar a requisição POST para o backend
        const uploadResponse = await axiosPrivate.post(
          "/user/uploadImage",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log("Imagem enviada com sucesso:", uploadResponse.data);
      } catch (error) {
        console.error("Erro ao enviar a imagem:", error);
      }
    } else {
      console.log("Nenhum arquivo selecionado!");
    }
  };

  return (
    <div className="h-screen bg-gradient-to-b from-purple-700 via-purple-400 to-purple-700 flex items-center justify-center">
      <div className="flex gap-8">
        {/* Seção do perfil */}
        <div
          className={`bg-black text-white p-8 rounded-lg border border-gray-700 max-w-md ${
            isEditing ? "center-profile-editing" : "center-profile"
          }`}
        >
          {userData && (
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold mb-4 flex items-center justify-center">
                Seu Perfil{" "}
                {isEditing ? (
                  <span
                    className="ml-2 cursor-pointer text-base"
                    onClick={handleSaveClick}
                  >
                    &#x1F4BE;
                  </span>
                ) : (
                  <span
                    className="ml-2 cursor-pointer text-base"
                    onClick={handleEditClick}
                  >
                    &#x1F589;
                  </span>
                )}
              </h1>
              {/* Restante da seção do perfil */}
              <div className="mb-4">
                <strong>Nome:</strong>{" "}
                {isEditing ? (
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="text-black border border-gray-500 rounded p-2"
                    readOnly={!isEditing}
                    style={{ width: "100%" }}
                  />
                ) : (
                  <span className="text-gray-500">{userData.user}</span>
                )}
              </div>
              <div className="mb-6">
                <strong>Email:</strong>{" "}
                {isEditing ? (
                  <>
                    <input
                      type="mail"
                      value={editedEmail}
                      onChange={(e) => setEditedEmail(e.target.value)}
                      className="text-black border border-gray-500 rounded p-2"
                      readOnly={!isEditing}
                      style={{ width: "100%" }}
                    />{" "}
                    {errorMessage && (
                      <p className="text-red-500 text-center mt-2">
                        {errorMessage}
                      </p>
                    )}
                  </>
                ) : (
                  <span className="text-gray-500">{userData.email}</span>
                )}
              </div>
			  <div className="mb-6">
                <strong>Nickname:</strong>{" "}
                {isEditing ? (
                  <>
                    <input
                      type="name"
                      value={editedNickname}
                      onChange={(e) => setEditedNickname(e.target.value)}
                      className="text-black border border-gray-500 rounded p-2"
                      readOnly={!isEditing}
                      style={{ width: "100%" }}
                    />{" "}
                    {errorMessage && (
                      <p className="text-red-500 text-center mt-2">
                        {errorMessage}
                      </p>
                    )}
                  </>
                ) : (
                  <span className="text-gray-500">{userData.nickname}</span>
                )}
              </div>
              <div className="mb-4">
                <img
                  src="https://i.imgur.com/VavB8Rm.png"
                  alt="Profile"
                  className="w-20 h-20 rounded-full mx-auto mb-4"
                />
                <input
                  type="file"
                  id="file"
                  className="hidden"
                  onChange={(e) => handleFileChange(e)}
                />
                {isEditing && (
                  <label
                    htmlFor="file"
                    className="block text-white rounded-full px-4 py-2 cursor-pointer"
                    style={{ width: "100%" }}
                  >
                    Alterar Foto
                  </label>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Seção para iniciar o jogo */}
        {!isEditing && (
          <>
            <div className="bg-black text-white p-8 rounded-lg border border-gray-700 max-w-md">
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">
                  {username} SEJA BEM-VINDO AO PONG GAME
                </h1>
                <p className="mb-4">
                  Desafie seus amigos em uma partida emocionante de Ping Pong!
                </p>
                <div className="flex justify-center">
                  <button className="bg-blue-600 text-white rounded-full px-4 py-2 mr-4">
                    Iniciar Jogo
                  </button>
                </div>
              </div>
            </div>
            {/* Seção para estatisticas */}
            <div className="bg-black text-white p-8 rounded-lg border border-gray-700 max-w-md">
              <div className="text-center mb-6">
                <h1 className="text-4xl font-bold mb-4">
                  Estatísticas do Usuário
                </h1>
                {/* Informações fictícias de estatísticas do usuário */}
                <div className="mb-4 flex flex-col items-center justify-center">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full mr-2"></div>
                    <strong>Vitórias:</strong> 25
                  </div>
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-red-500 rounded-full mr-2"></div>
                    <strong>Derrotas:</strong> 10
                  </div>
                  <div className="flex items-center">
                    <strong className="text-yellow-500">Pontuação:</strong> 500
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
