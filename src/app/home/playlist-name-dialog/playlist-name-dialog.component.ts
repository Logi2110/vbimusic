import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-playlist-name-dialog',
  templateUrl: './playlist-name-dialog.component.html',
  styleUrls: ['./playlist-name-dialog.component.scss']
})
export class PlaylistNameDialogComponent implements OnInit {
  playlist: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PlaylistNameDialogComponent>,
  ) { }

  ngOnInit(): void {
    this.playlist = this.fb.group({
      name: ['']
    });
  }

  createPlaylist() {
    this.dialogRef.close(this.playlist.value.name.trim());
  }

  cancelPlaylist() {
    this.dialogRef.close('');
  }

}
