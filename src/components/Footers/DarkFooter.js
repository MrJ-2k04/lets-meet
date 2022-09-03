/*eslint-disable*/
import React from "react";
import { Link } from "react-router-dom";

// reactstrap components
import { Col, Container, Row } from "reactstrap";

function DarkFooter() {
  return (
    <footer className="footer" data-background-color="black">
      <Container>
        <Row>
          <Col xs="6">
            <nav>
              <ul>
                <li>
                  <a href="https://www.webwizards.in" target="_blank" >
                    Webwizards
                  </a>
                </li>
                <li>
                  <Link to="/about">
                    About Us
                  </Link>
                </li>
              </ul>
            </nav>
          </Col>
          <Col>
            <div className="copyright" id="copyright">
              © Copyright {new Date().getFullYear()} | Designed & Created by MrJ
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default DarkFooter;
