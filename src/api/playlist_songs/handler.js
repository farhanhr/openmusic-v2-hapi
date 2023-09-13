
class PlaylistSongsHandler {
  constructor(playlistSongsService, playlistsService, validator){
    this._playlistSongsService = playlistSongsService;
    this._playlistsService = playlistsService;
    this._validator = validator;
  }

  async postPlaylistSongHandler(request, h) {
    this._validator.validatePlaylistSongsPayload(request.payload);

    const { id: playlist_id } = request.params;
    const { songId: song_id } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlist_id, credentialId);
    await this._playlistSongsService.verifySong(song_id);

    const playlistSongId = await this._playlistSongsService.addPlaylistSong({playlist_id, song_id});

    const response = h.response({
      status: 'success',
      message: 'Lagu telah ditambahkan ke playlist',
      data: {
        playlistSongId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongsHandler(request) {
    const {id: playlist_id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlist_id, credentialId);
    
    const playlist = await this._playlistsService.getPlaylistById(credentialId, playlist_id);
    const songs = await this._playlistSongsService.getPlaylistSongs(playlist_id);
    playlist.songs = songs;
    
    return {
      status: 'success',
      data: {
        playlist: playlist,
      },
    };
  }

  async deletePlaylistSongByIdHandler(request) {
    this._validator.validatePlaylistSongsPayload(request.payload);
    
    const { id: playlist_id } = request.params;
    const { songId: song_id } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlist_id, credentialId);
    await this._playlistSongsService.deletePlaylistSongById(playlist_id, song_id);

    return {
      status: 'success',
      message: 'Lagu telah dihapus dari playlist',
    };
  }
}

module.exports = PlaylistSongsHandler;