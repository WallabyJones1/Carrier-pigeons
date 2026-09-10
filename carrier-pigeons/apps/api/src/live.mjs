export function createLiveHub() {
  const clients = new Set();
  let sequence = 0;

  function connect(response) {
    clients.add(response);
    response.write(`event: hello\ndata: ${JSON.stringify({ type: 'hello', sequence, at: new Date().toISOString() })}\n\n`);
    return () => clients.delete(response);
  }

  function broadcast(event) {
    sequence += 1;
    const message = { ...event, sequence, at: event.at ?? new Date().toISOString() };
    const encoded = `id: ${sequence}\nevent: ${message.type ?? 'message'}\ndata: ${JSON.stringify(message)}\n\n`;
    for (const client of clients) {
      try { client.write(encoded); } catch { clients.delete(client); }
    }
    return message;
  }

  return { connect, broadcast, clientCount: () => clients.size };
}
