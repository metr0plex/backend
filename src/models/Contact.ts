import { Pool, PoolClient, QueryResult } from 'pg';

export class Contact {
  cid: number;
  name: string;
  surname: string;
  post: string;
  static pool: Pool;

  constructor(cid: number, name: string, surname: string, post: string) {
    this.cid = cid;
    this.name = name;
    this.surname = surname;
    this.post = post;
  }
  static async findAll(): Promise<any[]> {
    const client = await this.pool.connect();
    try {
      const result: QueryResult = await client.query(`
                SELECT 
                    u.cid,
                    u.name,
                    u.surname,
                    u.post,
                    COALESCE(SUM(CASE WHEN c.src =  u.cid  THEN 1 ELSE 0 END), 0) AS outgoing_calls_count,
                    COALESCE(SUM(CASE WHEN c.trg =  u.cid THEN 1 ELSE 0 END), 0) AS incoming_calls_count
                FROM 
                    contacts u
                LEFT JOIN 
                    calls c ON u.cid = c.trg OR u.cid = c.src
                GROUP BY 
                    u.cid, u.name, u.surname, u.post;
            `);
      return result.rows;
    } finally {
      client.release();
    }
  }
  static async findById(id: number): Promise<any[]> {
    const client = await this.pool.connect();
    try {
      const result: QueryResult = await client.query(`
            SELECT
                u.cid,
                u.name,
                u.surname,
                u.post,
                JSON_AGG(
                    jsonb_build_object(
                        'type', 
                        CASE
                        WHEN c.src = u.cid THEN 'incoming'
                        WHEN c.trg = u.cid THEN 'outgoing'
                        END,
                        'status', c.status,
                        'duration', c.duration,
                        'partyName', CONCAT_WS(' ', party.name, party.surname)
                    )
                ) AS calls
            FROM
                contacts u
            LEFT JOIN
                calls c ON u.cid = c.src OR u.cid = c.trg
            LEFT JOIN
                contacts party ON CASE
                WHEN c.src = u.cid THEN c.trg
                WHEN c.trg = u.cid THEN c.src
                END = party.cid
            WHERE
                u.cid = ${id}
            GROUP BY
                u.cid, u.name, u.surname, u.post;
        `);

      return result.rows;
    } finally {
      client.release();
    }
  }
  static async addNewUser(client: PoolClient, user: Contact): Promise<void> {
    try {
      const client = await this.pool.connect();
      const result: QueryResult = await client.query(
        `
                INSERT INTO contacts (name, surname, post)
                VALUES ($1, $2, $3)
                RETURNING *;
            `,
        [user.name, user.surname, user.post],
      );
      return result.rows[0];
    } catch (error) {
      console.error('Ошибка при добавлении пользователя:', error);
      throw error;
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  static async updateContactById(id: number, updatedContact: Contact): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `
                UPDATE contacts
                SET name = $1, surname = $2, post = $3
                WHERE cid = $4
                RETURNING *;
            `,
        [updatedContact.name, updatedContact.surname, updatedContact.post, id],
      );

      if (result.rowCount !== null) {
        if (result.rowCount > 0) {
          return true;
        }
      }
    } catch (error) {
      console.error('Ошибка при обновлении контакта:', error);
    } finally {
      client.release();
    }
    return false;
  }
}
