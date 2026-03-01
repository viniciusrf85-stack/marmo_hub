import '../styles/footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>MarmoHub</h3>
            <p>Marketplace de Pedras Ornamentais do Espírito Santo</p>
          </div>

          <div className="footer-section">
            <h4>Links Rápidos</h4>
            <ul>
              <li><a href="/">Início</a></li>
              <li><a href="/empresas">Empresas</a></li>
              <li><a href="/sobre">Sobre</a></li>
              <li><a href="/contato">Contato</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Categorias</h4>
            <ul>
              <li><a href="/?tipo=granito">Granito</a></li>
              <li><a href="/?tipo=marmore">Mármore</a></li>
              <li><a href="/?tipo=quartzito">Quartzito</a></li>
              <li><a href="/?tipo=limestone">Limestone</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contato</h4>
            <ul>
              <li>📧 contato@marmohub.com</li>
              <li>📱 (27) 99999-9999</li>
              <li>📍 Espírito Santo, Brasil</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 MarmoHub. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer



