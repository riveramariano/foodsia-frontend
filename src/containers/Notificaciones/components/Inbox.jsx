import React, { useState } from "react";
import { EmailsProps } from "../../../shared/prop-types/EmailProps";
import InboxTable from "./InboxTable";

const labels = [
  { color: "green", title: "Cumpleaños Mascota" },
  { color: "red", title: "Día Festivo" },
  { color: "blue", title: "Aniversario Cliente" },
  { color: "yellow", title: "Aniversario GPF" },
  { color: "purple", title: "Ausencia Empleado" },
  { color: "orange", title: "Entrega Pedido" },
];

const Inbox = ({ emails }) => {
  // eslint-disable-next-line no-unused-vars
  const [isComposed, setIsComposed] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [email, setEmail] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [mailbox, setMailbox] = useState(0);
  const [label, setLabel] = useState(0);
  const [isOpenedMailboxes, setIsOpenedMailboxes] = useState(false);

  const labelsWithID = labels.map((item, index) => ({ ...item, id: index }));

  const onLabel = (index) => {
    setLabel(index);
    setIsComposed(false);
    setEmail(false);
  };

  const onLetter = () => {
    setEmail(true);
  };

  const onOpenMailboxes = () => {
    setIsOpenedMailboxes(!isOpenedMailboxes);
  };

  return (
    <div
      className={`inbox${isOpenedMailboxes ? " inbox--show-mailboxes" : ""}`}
      onClick={isOpenedMailboxes ? onOpenMailboxes : null}
      role="presentation"
    >
      <div className="inbox__mailbox-list">
        <p className="inbox__labels">Notificaciones</p>
        {labelsWithID.map((item, index) => (
          <button
            type="button"
            key={item.id}
            onClick={() => onLabel(index)}
            className={`inbox__list-button inbox__label${
              label === index ? " active" : ""
            }`}
          >
            <span
              className={`inbox__label-color inbox__label-color--${item.color}`}
            />
            {item.title}
          </button>
        ))}
      </div>
      <div className="inbox__container">
        <div>
          <InboxTable emails={emails} onLetter={onLetter} />
        </div>
      </div>
    </div>
  );
};

Inbox.propTypes = {
  emails: EmailsProps.isRequired,
};

export default Inbox;
