

import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import {
    Button,
    Collapse,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    UncontrolledDropdown,
    NavbarBrand,
    Navbar,
    NavItem,
    NavLink,
    Nav,
    Container,
    UncontrolledTooltip,
    NavbarText,
} from "reactstrap";

// Hooks
import { useAuth } from "services/hooks/useAuth";
import { useSignout } from "services/hooks/useSignout";


function FinalNavbar() {

    const [navbarColor, setNavbarColor] = useState("navbar-transparent");
    const [collapseOpen, setCollapseOpen] = useState(false);
    const { user } = useAuth();
    const { signUserOut, isLoading, error } = useSignout()
    const nav = useNavigate();

    useEffect(() => {
        const updateNavbarColor = () => {
            if (
                document.documentElement.scrollTop > 399 ||
                document.body.scrollTop > 399
            ) {
                setNavbarColor("");
            } else if (
                document.documentElement.scrollTop < 400 ||
                document.body.scrollTop < 400
            ) {
                setNavbarColor("navbar-transparent");
            }
        };
        window.addEventListener("scroll", updateNavbarColor);
        return function cleanup() {
            window.removeEventListener("scroll", updateNavbarColor);
        };
    });

    return (
        <>
            {collapseOpen ? (
                <div
                    id="bodyClick"
                    onClick={() => {
                        document.documentElement.classList.toggle("nav-open");
                        setCollapseOpen(false);
                    }}
                />
            ) : null}
            <Navbar className={"fixed-top " + navbarColor} expand="lg" color="info">
                <Container>

                    <div className="navbar-translate">
                        <NavbarBrand to="/" id="navbar-brand" tag={Link}>
                            LetsMeet
                        </NavbarBrand>
                        <UncontrolledTooltip target="#navbar-brand">
                            Have a place to meet!
                        </UncontrolledTooltip>
                        <button
                            className="navbar-toggler navbar-toggler"
                            onClick={() => {
                                document.documentElement.classList.toggle("nav-open");
                                setCollapseOpen(!collapseOpen);
                            }}
                            aria-expanded={collapseOpen}
                            type="button"
                        >
                            <span className="navbar-toggler-bar top-bar"></span>
                            <span className="navbar-toggler-bar middle-bar"></span>
                            <span className="navbar-toggler-bar bottom-bar"></span>
                        </button>
                    </div>

                    <Collapse className="justify-content-end" isOpen={collapseOpen} navbar>
                        <Nav navbar>

                            {user && <>

                                {/* Meeting Link */}
                                <NavItem>
                                    <NavLink to="/meeting" tag={Link}>
                                        <i className="icon material-icons mr-1">
                                            videocam
                                        </i>
                                        <p>Meeting</p>
                                    </NavLink>
                                </NavItem>

                                {/* User Profile Section */}
                                <UncontrolledDropdown nav>
                                    <DropdownToggle caret color="default" nav>
                                        <i className="now-ui-icons users_circle-08"></i>
                                        <p>{user.displayName}</p>
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        <DropdownItem to="/profile" tag={Link}>
                                            <i className="icon material-icons mr-1"> edit </i>
                                            <p>Profile</p>
                                        </DropdownItem>
                                        <DropdownItem onClick={signUserOut}>
                                            <i className="icon material-icons mr-1">logout</i>
                                            <p>Sign out</p>
                                        </DropdownItem>
                                    </DropdownMenu>
                                </UncontrolledDropdown>

                            </>}

                            {!user && <>
                                {/* Get Started */}
                                <NavItem>
                                    <Button
                                        className="nav-link btn btn-primary btn-round"
                                        id="upgrade-to-pro"
                                        to="/login"
                                        tag={Link}
                                    >
                                        <p>GET STARTED</p>
                                    </Button>
                                    <UncontrolledTooltip target="#upgrade-to-pro">
                                        Get Started within a few Steps
                                    </UncontrolledTooltip>
                                </NavItem>

                                <NavItem>
                                    <NavLink href="#" id="instagram-tooltip">
                                        <i className="fab fa-instagram"></i>
                                        <p className="d-lg-none d-xl-none">Instagram</p>
                                    </NavLink>
                                    <UncontrolledTooltip target="#instagram-tooltip">
                                        Follow us on Instagram
                                    </UncontrolledTooltip>
                                </NavItem>

                            </>}

                        </Nav>
                    </Collapse>

                </Container>
            </Navbar>
        </>
    );
}

export default FinalNavbar;