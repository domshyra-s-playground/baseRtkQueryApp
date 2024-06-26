using System.Collections.Generic;
using System.Threading.Tasks;
using Models;

namespace Interfaces
{
    /// <summary>
    /// Provides methods to query Spotify
    /// </summary>
    public interface ISpotifyRepo
    {
        /// <summary>
        /// Gets playlists from Spotify
        /// </summary>
        /// <returns></returns>
        Task<List<PlaylistsModel>> GetPlaylists();

        /// <summary>
        /// Gets information about a playlist from Spotify
        /// </summary>
        /// <param name="playlistId"></param>
        /// <returns></returns>
        Task<PlaylistsModel> GetPlaylist(string playlistId);

        /// <summary>
        /// Returns a list of genres
        /// </summary>
        /// <returns>
        Task<List<string>> GetGenres();
    }
}