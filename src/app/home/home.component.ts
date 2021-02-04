import { Component, OnInit, ViewChild } from '@angular/core';
import { SongService } from '../song.service';
import { BehaviorSubject, combineLatest, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabGroup } from '@angular/material/tabs';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { PlaylistNameDialogComponent } from './playlist-name-dialog/playlist-name-dialog.component';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  @ViewChild("musicTab", { static: false }) musicTab: MatTabGroup;
  searchSongString$ = new BehaviorSubject<string>('');
  playlists = JSON.parse(localStorage.getItem('playlists'));
  isAllSongsTab = true;

  songs = combineLatest([this.songService.songs$, this.searchSongString$]).pipe(
    map(([songs, searchSongString ]) => {
      songs = songs.filter(song => song.title.substring(0, searchSongString?.length) == searchSongString);
      songs = songs.splice(0, 10)
      return songs;
    })
  )

  constructor(
    private songService: SongService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    console.log(this.songService.getTab())
    this.songService.setPlaylist({});
    // if(this.route.snapshot.fragment == 'playlist') {
    //   this.isAllSongs = false;
    // }
  }

  ngAfterViewInit()	{
    if(this.songService.getTab()) {
      this.musicTab.selectedIndex = 1;
    }
  }

  searchSong(string) {
    this.searchSongString$.next(string.trim().toLowerCase());
  }

  createPlaylist() {
    const dialogRef = this.dialog.open(PlaylistNameDialogComponent, {
      backdropClass: 'playlist-name-dialog-backdrop',
      panelClass: 'playlist-name-dialog-panel'
    });

    dialogRef.afterClosed().subscribe(
      playlistName => {
        if(playlistName?.length) {
          this.router.navigate(['playlist/0'], { queryParams: { playlistName: playlistName }});
        }
      }
    );
  }

  goToPlaylist(playlist) {
    this.songService.setPlaylist(playlist);
    this.router.navigateByUrl(`playlist/${playlist.id}`);
  }

}
