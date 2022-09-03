
import React, { useEffect, useState } from "react";

// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Container,
  Col,
  Spinner
} from "reactstrap";

// core components
import ExamplesNavbar from "components/Navbars/ExamplesNavbar.js";
import TransparentFooter from "components/Footers/TransparentFooter.js";
import FinalNavbar from "components/Navbars/FinalNavbar";
import { Link } from "react-router-dom";
import { useSignin } from "services/hooks/useSignin";

function LoginPage() {

  const [firstFocus, setFirstFocus] = useState(false);
  const [lastFocus, setLastFocus] = useState(false);

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { signIn, isLoading, error } = useSignin()

  const handleLogin = (e) => {
    e.preventDefault()
    signIn(email, password);
  }

  useEffect(() => {
    document.body.classList.add("login-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    return function cleanup() {
      document.body.classList.remove("login-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, []);


  return (
    <>
      <FinalNavbar />
      <div className="page-header clear-filter" filter-color="blue">
        <div
          className="page-header-image"
          style={{
            backgroundImage: "url(" + require("assets/img/login.jpg") + ")"
          }}
        ></div>
        <div className="content">
          <Container>
            <Col className="ml-auto mr-auto" md="4">
              <Card className="card-login card-plain">
                <Form className="form" action="" onSubmit={handleLogin}>


                  <CardHeader className="text-center">
                    <div className="logo-container">
                      <img
                        alt="..."
                        src={require("assets/img/now-logo.png")}
                      ></img>
                    </div>
                  </CardHeader>

                  <CardBody>

                    {/* Email */}
                    <InputGroup
                      className={
                        "no-border input-lg" +
                        (firstFocus ? " input-group-focus" : "")
                      }
                    >
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="now-ui-icons users_circle-08"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        placeholder="Email"
                        type="email"
                        onFocus={() => setFirstFocus(true)}
                        onBlur={() => setFirstFocus(false)}
                        value={email} 
                        onChange={(e)=>setEmail(e.target.value)}
                        required
                      ></Input>
                    </InputGroup>

                    {/* Password */}
                    <InputGroup
                      className={
                        "no-border input-lg" +
                        (lastFocus ? " input-group-focus" : "")
                      }
                    >
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="now-ui-icons ui-1_lock-circle-open"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        placeholder="Password"
                        type="password"
                        onFocus={() => setLastFocus(true)}
                        onBlur={() => setLastFocus(false)}
                        value={password} 
                        onChange={(e)=>setPassword(e.target.value)}
                        required
                      ></Input>
                    </InputGroup>

                  </CardBody>


                  <CardFooter className="text-center">
                    {/* Login Button */}
                    <Button
                      block
                      className="btn-round"
                      color="primary"
                      size="lg"
                      disabled={isLoading}
                    >
                      {!isLoading && "Login"}
                      {isLoading && <Spinner size="sm" />}
                    </Button>

                    {/* Create Account */}
                    <div className="pull-left">
                      <h6>
                        <Link className="link" to="/signup">
                          Create Account
                        </Link>
                      </h6>
                    </div>

                    {/* Need Help? */}
                    <div className="pull-right">
                      <h6>
                        <a
                          className="link"
                          href="#pablo"
                          onClick={(e) => e.preventDefault()}
                        >
                          Need Help?
                        </a>
                      </h6>
                    </div>
                    
                  </CardFooter>

                </Form>
              </Card>
            </Col>
          </Container>
        </div>
        <TransparentFooter />
      </div>
    </>
  );
}

export default LoginPage;
