const MyMessage = ({ message }: any) => {
  if (message.attachments?.length > 0) {
    return (
      <img
        src={message.attachments[0].file}
        alt="attachment"
        className="message-image"
        style={{ float: 'right' }}
      />
    );
  }

  return (
    <div className="message" style={{ float: 'right', backgroundColor: '#3B2A50', color: 'white', marginRight: '18px' }}>
      {message.text}
    </div>
  );
};

export default MyMessage;
