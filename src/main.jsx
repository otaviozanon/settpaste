import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import ViewPaste from "./ViewPaste";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/:id" element={<ViewPaste />} />
    </Routes>
  </BrowserRouter>
);
