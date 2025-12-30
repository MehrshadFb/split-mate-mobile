import React from "react";
import { PageHeader } from "../../../shared/components/PageHeader";

interface SettingsHeaderProps {
  title: string;
  subtitle: string;
}

export const SettingsHeader: React.FC<SettingsHeaderProps> = ({
  title,
  subtitle,
}) => {
  return <PageHeader title={title} subtitle={subtitle} />;
};
