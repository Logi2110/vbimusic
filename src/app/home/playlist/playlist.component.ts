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
  songsSub: Subscription;
  playlistId = null;
  playlistName;
  addSongs = [];

  songs$ = combineLatest([this.songService.songs$, this.searchSongString$]).pipe(
    map(([songs, searchSongString ]) => {
      songs.map(song => {
        if(this.playlist$?.value?.id) {
          song['isSelected'] = this.playlist$.value.songs.some(x => x.id == song.id);
        }
      })
      songs = songs.filter(song => song.title.substring(0, searchSongString.length) == searchSongString);
      songs = songs.sort((song1: any, song2: any) => song2.isSelected - song1.isSelected);
      songs = songs.splice(0, 10);
      return songs;
    }),
    tap(data => console.log('song', data))
  )

  constructor(
    private songService: SongService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.songService.setTab();
    this.playlist$.subscribe(data => console.log('playlist', data))
  }

  ngOnInit(): void {
    this.playlistName = this.route.snapshot.queryParams.playlistName;
    this.playlist$.next(this.songService.getPlaylist());
    this.songsSub = this.songs$.pipe(
      map((songs) => {
        return songs;
      })
    ).subscribe(data => {
      this.songs = data;
    })

    this.playlist$.subscribe(playlist => {
      console.log(playlist)
      if(playlist?.songs) {
        this.addSongs = [...playlist.songs];
      }
    })

    if(this.playlist$?.value?.id) {
      this.playlistPage = 'playlist';
    } else {
      this.playlistPage = 'noSong';
    }
  }

  savePlaylist() {
    let prePlaylists = JSON.parse(localStorage.getItem('playlists'));
    if(this.playlist$?.value?.id) {
      let updatePlaylist = this.playlist$.value;
      updatePlaylist.songs = [...this.addSongs];
      this.playlist$.next(updatePlaylist);
      let updatePlaylistIndex = prePlaylists.findIndex( playlist => playlist.id == this.playlistId);
      prePlaylists[updatePlaylistIndex] = updatePlaylist;
    } else {
      let playlist = {
        songs: [...this.addSongs],
        createdAt: new Date(),
        id: +localStorage.getItem('playlistId') + 1,
        name: this.playlistName
      }
      this.playlistId = Number(localStorage.getItem('playlistId')) + 1;
      localStorage.setItem('playlistId', this.playlistId);
      this.playlist$.next(playlist);
      prePlaylists.push(playlist);
    }

    localStorage.setItem('playlists', JSON.stringify(prePlaylists));
    this.searchSongString$.next('')
    this.playlistPage = 'playlist';
  }

  goToPlaylistPage() {
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

  searchSong(string) {
    this.searchSongString$.next(string);
  }

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

  addSongToPlaylist() {
    // this.searchSongString$.next('');
    this.playlistPage = 'selectSong';
  }

  backToHomePage() {
    this.router.navigate(['']);
  }

  ngOnDestroy() {
    this.songsSub.unsubscribe();
  }

}
