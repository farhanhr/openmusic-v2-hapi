const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistSongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylistSong({playlist_id, song_id}) {
    const id = `playlist_songs-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlist_id, song_id],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }
    return result.rows[0].id;
  }

  async getPlaylistSongs(playlist_id) {
    const query = {
      text:  `SELECT songs.id, songs.title, songs.performer FROM songs 
        JOIN playlist_songs ON songs.id = playlist_songs.song_id
        JOIN playlists ON playlist_songs.playlist_id = playlists.id
        WHERE playlist_songs.playlist_id = $1`,
      values: [playlist_id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return result.rows;
  }

  async deletePlaylistSongById(playlist_id, song_id) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE song_id = $1 AND playlist_id = $2 RETURNING id',
      values: [song_id, playlist_id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu playlist tidak ditemukan');
    }
  }

  async verifySong(song_id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [song_id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }
  }

}

module.exports = PlaylistSongsService;