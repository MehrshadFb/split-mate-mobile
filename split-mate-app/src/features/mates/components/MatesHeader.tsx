import React from "react";
import { PageHeader } from "../../../shared/components/PageHeader";

interface MatesHeaderProps {
  title: string;
  subtitle: string;
}

export const MatesHeader: React.FC<MatesHeaderProps> = ({
  title,
  subtitle,
}) => {
  return <PageHeader title={title} subtitle={subtitle} />;
};
