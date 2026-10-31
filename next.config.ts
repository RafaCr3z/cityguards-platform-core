import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  // SDKs Azure só de servidor: carregados do node_modules em vez de empacotados.
  // O @azure/identity referencia binários do sistema (ex: powershell.exe, via "open"),
  // que o Turbopack tentava empacotar e fazia o build falhar.
  serverExternalPackages: ["@azure/identity", "@azure/storage-blob"],
};

export default nextConfig;
