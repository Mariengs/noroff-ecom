import Header from "../Header/Header";
import Footer from "../Footer/Footer";

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <Header />
      <main className="container">{children}</main>
      <Footer />
    </div>
  );
}
