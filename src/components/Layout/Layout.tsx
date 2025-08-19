import type { ReactNode } from "react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

type Props = {
  children: ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
