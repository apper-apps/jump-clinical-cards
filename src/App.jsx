import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import GameBoard from "@/components/pages/GameBoard";
import GroupLobby from "@/components/pages/GroupLobby";
import CollaborativeBoard from "@/components/pages/CollaborativeBoard";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
<Routes>
<Route path="/" element={<GameBoard />} />
<Route path="/group" element={<GroupLobby />} />
<Route path="/collaborative/:groupId" element={<CollaborativeBoard />} />
</Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          className="z-[9999]"
        />
      </div>
    </BrowserRouter>
  );
}

export default App;