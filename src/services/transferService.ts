import { pool } from "../config/db";
import { User, TranferResult } from "../models/user";

export const transferFunds = async (
  senderId: number,
  receiverId: number,
  amount: number,
): Promise<TranferResult> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const [firstId, secondId] =
      senderId < receiverId ? [senderId, receiverId] : [receiverId, senderId];

    await client.query("SELECT id from users WHERE id = $1 FOR UPDATE", [
      firstId,
    ]);
    await client.query("SELECT id from users WHERE id = $1 FOR UPDATE", [
      secondId,
    ]);

    // Fetch sender
    const senderResult = await client.query<User>(
      "SELECT id, username, balance FROM users WHERE id = $1",
      [senderId],
    );

    if (senderResult.rows.length === 0) {
      throw new Error(`Sender with id ${senderId} not found`);
    }

     // Fetch receiver
    const receiverResult = await client.query<User>(
      "SELECT id, username, balance FROM users WHERE id = $1",
      [receiverId]
    );

    if (receiverResult.rows.length === 0) {
      throw new Error(`Receiver with id ${receiverId} not found`);
    }

    const sender = senderResult.rows[0];

    // Check sufficient funds
    if (Number(sender.balance) < amount) {
      throw new Error(
        `Insufficient funds: ${sender.username} has $${sender.balance} but tried to send $${amount}`
      );
    }

    // Deduct from sender
    const updatedSender = await client.query<User>(
      "UPDATE users SET balance = balance - $1 WHERE id = $2 RETURNING id, username, balance",
      [amount, senderId]
    );

    // Add to receiver
    const updatedReceiver = await client.query<User>(
      "UPDATE users SET balance = balance + $1 WHERE id = $2 RETURNING id, username, balance",
      [amount, receiverId]
    );

    await client.query("COMMIT");

    return {
      message: "Transaction successful",
      sender: updatedSender.rows[0],
      receiver: updatedReceiver.rows[0],
    };


  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
