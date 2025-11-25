import React from "react";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/apiClient";

const Certificates = () => {
  const openServerCertificates = () => {
    window.location.href = `${API_BASE_URL}/certificates/my`;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-xl w-full text-center space-y-4">
        <h1 className="text-3xl font-bold">Certificates</h1>
        <p className="text-muted-foreground">
          Certificates are issued by the server. Download your issued
          certificates directly from the secure endpoint below.
        </p>
        <Button onClick={openServerCertificates}>
          Open My Certificates
        </Button>
      </div>
    </div>
  );
};

export default Certificates;
