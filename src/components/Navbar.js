import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
    },
    appbar: {
        backgroundColor: 'rgb(37, 167, 167)',        
    },
    title: {
        flexGrow: 1,
        textAlign: 'center',
        fontFamily: "'Fredericka the Great', cursive"
    },
}));

export default function Navbar() {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <AppBar position="static" className={classes.appbar}>
                <Toolbar>
                    <Typography variant="h4" className={classes.title}>
                        TRIPPIN
                    </Typography>
                </Toolbar>
            </AppBar>
        </div>
    );
}