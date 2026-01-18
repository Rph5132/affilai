import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Toaster } from "@/components/ui/sonner";
import { Dashboard } from "@/pages/Dashboard";
import { Products } from "@/pages/Products";
import { Links } from "@/pages/Links";
import { Campaigns } from "@/pages/Campaigns";
import { Analytics } from "@/pages/Analytics";
import { Settings } from "@/pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/links" element={<Links />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
      <Toaster position="bottom-right" richColors />
    </BrowserRouter>
  );
}

export default App;
