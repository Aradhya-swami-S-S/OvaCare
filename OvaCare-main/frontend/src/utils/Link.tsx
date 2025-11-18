import React from 'react';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  children: React.ReactNode;
}

export const Link: React.FC<LinkProps> = ({ to, children, ...rest }) => {
  // In a real app with a router, this would use the router's Link component
  // For now, we'll simulate it with a regular anchor tag
  return (
    <a href={to} {...rest}>
      {children}
    </a>
  );
};