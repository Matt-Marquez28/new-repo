import { Toast as BootstrapToast, ToastContainer } from "react-bootstrap";

const Toast = ({ show, message, onClose, variant }) => {
  return (
    <ToastContainer
      position="bottom-end"
      className="p-3"
      style={{
        position: "fixed", // Fix it to the viewport
        bottom: "20px", // Space from the bottom
        right: "20px", // Space from the right
        zIndex: 9999, // Ensure it stays on top
        pointerEvents: "none", // Prevents interference with other elements
      }}
    >
      <BootstrapToast
        show={show}
        onClose={onClose}
        autohide
        delay={3000}
        bg={variant}
      >
        <BootstrapToast.Header>
          <strong className="me-auto">Notification</strong>
          <small>Just now</small>
        </BootstrapToast.Header>
        <BootstrapToast.Body className="text-light">
          {message}
        </BootstrapToast.Body>
      </BootstrapToast>
    </ToastContainer>
  );
};

export default Toast;
