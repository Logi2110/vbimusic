import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { SongService } from 'src/app/song.service';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent implements OnInit {
  searchSongString = new BehaviorSubject('');
  playlist = new BehaviorSubject([]);
  playlistPage = 'noSong'
  songs;
  songsSub: Subscription;
  playlistId = null;
  playlistName;

  songs$ = combineLatest([this.songService.songs, this.searchSongString]).pipe(
    map(([songs, searchSongString ]) => {
      songs = songs.filter(song => song.title.substring(0, searchSongString.length) == searchSongString)
      return songs;
    })
  )

  constructor(
    private songService: SongService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.playlistId = +this.route.snapshot.params['id'];
    this.playlistName = this.route.snapshot.queryParams.playlistName;
    this.songsSub = this.songs$.pipe(
      map((songs) => {
        if(this.playlistId == 0) {
          return songs;
        } else {
          let prePlaylists = JSON.parse(localStorage.getItem('playlists'));
          let playlist = prePlaylists.find(playlist => playlist.id == this.playlistId);
          songs.map(song => {
            song['isSelected'] = playlist.songs.some(x => x.id == song.id);
            return song;
          });
          this.playlistName = playlist.name;
          this.playlist.next(playlist.songs);
          return songs;
        }
      })
    ).subscribe(data => {
      this.songs = data;
    })

    if(!(this.playlistId == 0)) {
      this.playlistPage = 'playlist';
    } else {
      this.playlistPage = 'noSong';
    }
  }

  savePlaylist() {
    let prePlaylists = JSON.parse(localStorage.getItem('playlists'));
    if(this.playlistId) {
      let updatePlaylistIndex = prePlaylists.findIndex( playlist => playlist.id == this.playlistId);
      let updatePlaylist = prePlaylists[updatePlaylistIndex];
      updatePlaylist.songs = this.playlist.value;
      updatePlaylist.createdAt = new Date();
      prePlaylists[updatePlaylistIndex] = updatePlaylist;
    } else {
      let playlist = {
        songs: this.playlist.value,
        createdAt: new Date(),
        id: +localStorage.getItem('playlistId') + 1,
        name: this.playlistName
      }
      localStorage.setItem('playlistId', `${+localStorage.getItem('playlistId') + 1}`)
      prePlaylists = [...prePlaylists, playlist];
      this.playlistId = localStorage.getItem('playlistId');
    }

    localStorage.setItem('playlists', JSON.stringify(prePlaylists));
    this.playlistPage = 'playlist';
  }

  goToPlaylistPage() {
    this.playlistPage = 'playlist';
  }

  searchSong(string) {
    this.searchSongString.next(string);
  }

  selectSong(song) {
    song.isSelected = !song.isSelected;
    if(song.isSelected) {
      this.playlist.next([...this.playlist.value, song])
    } else {
      this.playlist.value.splice(this.playlist.value.findIndex(x => x.id == song.id), 1)
      this.playlist.next([...this.playlist.value])
    }
  }

  addSongToPlaylist() {
    this.playlistPage = 'selectSong';
  }

  backToHomePage() {
    // this.router.navigate([''], { fragment: 'playlist' });
    this.router.navigate(['']);

  }

  ngOnDestroy() {
    this.songsSub.unsubscribe();
  }

}
