import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { SongService } from 'src/app/song.service';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent implements OnInit {
  searchSongString$ = new BehaviorSubject('');
  playlist$ = new BehaviorSubject<any>({});
  playlistPage = 'noSong';
  songs;
  playlistName;
  addSongs = [];

  // called when you search the song
  songsSub$ = combineLatest([this.songService.songs$, this.searchSongString$]).pipe(
    map(([songs, searchSongString ]) => {
      songs.map(song => {
        if(this.playlist$?.value?.id) {
          song['isSelected'] = this.playlist$.value.songs.some(x => x.id == song.id);
        }
      })

      if(this.playlist$.value?.songs) {
        this.addSongs = [...this.playlist$.value.songs];
      }

      songs = songs.filter(song => song.title.substring(0, searchSongString.length) == searchSongString);
      songs = songs.sort((song1: any, song2: any) => song2.isSelected - song1.isSelected);
      songs = songs.splice(0, 10);
      return songs;
    }),
    tap(data => console.log('playlist', this.playlist$.value, 'addSong', this.addSongs, 'song', data))
  ).subscribe(songs => this.songs = songs)

  constructor(
    private songService: SongService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.songService.setTab();
  }

  ngOnInit(): void {
    this.playlistName = this.route.snapshot.queryParams.playlistName;
    this.playlist$.next(this.songService.getPlaylist());
    // called when you save the songs
    this.playlist$.subscribe(playlist => {
      if(playlist?.songs && this.songs) {
        this.addSongs = [...playlist.songs];
        this.songs.map(song => {
          song['isSelected'] = playlist.songs.some(x => x.id == song.id);
        })
      }
      console.log('playlist', playlist, 'addSongs', this.addSongs, 'songs', this.songs)
    })

    if(this.playlist$?.value?.id) {
      this.playlistPage = 'playlist';
    } else {
      this.playlistPage = 'noSong';
    }
  }

  // called when you save the songs
  savePlaylist() {
    let prePlaylists = JSON.parse(localStorage.getItem('playlists'));
    if(this.playlist$?.value?.id) {
      let updatePlaylist = this.playlist$.value;
      updatePlaylist.songs = [...this.addSongs];
      this.playlist$.next(updatePlaylist);
      let updatePlaylistIndex = prePlaylists.findIndex( playlist => playlist.id == this.playlist$.value.id);
      prePlaylists[updatePlaylistIndex] = updatePlaylist;
    } else {
      let playlist = {
        songs: [...this.addSongs],
        createdAt: new Date(),
        id: +localStorage.getItem('playlistId') + 1,
        name: this.playlistName
      }
      let playlistId = Number(localStorage.getItem('playlistId')) + 1;
      localStorage.setItem('playlistId', String(playlistId));
      this.playlist$.next(playlist);
      prePlaylists.push(playlist);
    }

    localStorage.setItem('playlists', JSON.stringify(prePlaylists));
    this.searchSongString$.next('')
    this.playlistPage = 'playlist';
  }

  // called when you unsave the song selection
  unsavePlaylist() {
    this.songs.map(song => {
      song.isSelected = this.playlist$.value.songs.some(x => x.id == song.id);
    });
    this.addSongs = [...this.playlist$.value.songs];
    if(this.playlist$.value.id) {
      this.playlistPage = 'playlist';
    } else {
      this.router.navigate(['']);
    }
  }

  // called during you select and unselect the songs
  selectSong(song) {
    song.isSelected = !song.isSelected;
    if(song.isSelected) {
      this.addSongs.push(song)
    } else {
      if(this.addSongs.findIndex(x => x.id == song.id) >= 0) {
        this.addSongs.splice(this.addSongs.findIndex(x => x.id == song.id), 1);
      }
    }
    console.log(this.addSongs)
  }

  searchSong(string) {
    this.searchSongString$.next(string);
  }

  // called when you land on select song page
  addSongToPlaylist() {
    this.playlistPage = 'selectSong';
  }

  backToHomePage() {
    this.router.navigate(['']);
  }

  ngOnDestroy() {
    this.songsSub$.unsubscribe();
  }

  shuffleSongs(playlist){
    let songs = playlist.songs;
    let songsLength = songs.length;
    let t, i;
    while(songsLength) {
      i = Math.floor(Math.random() * songsLength--);
      t = songs[songsLength];
      songs[songsLength] = songs[i];
      songs[i] = t;
    }
    this.playlist$.next(playlist);
  }

}
