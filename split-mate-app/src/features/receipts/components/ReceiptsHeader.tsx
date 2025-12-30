import React from "react";
import { PageHeader } from "../../../shared/components/PageHeader";

interface ReceiptsHeaderProps {
  title: string;
  subtitle: string;
}

export const ReceiptsHeader: React.FC<ReceiptsHeaderProps> = ({
  title,
  subtitle,
}) => {
  return <PageHeader title={title} subtitle={subtitle} />;
};
