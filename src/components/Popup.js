import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import DirectionsIcon from '@material-ui/icons/Directions';

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
        color: 'white'
    },
    // card: {
    //     minWidth: 275,
    // },
    bullet: {
        display: 'inline-block',
        margin: '0 2px',
        transform: 'scale(0.8)',
    },
    title: {
        fontSize: 14,
    },
    pos: {
        marginBottom: 12,
    },
    valueCell: {
        wordBreak: "break-word",
        padding: '8px !important'
    }
}));

export default function Popup(props) {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <Card className={classes.card} variant="outlined">
                <CardContent>
                    <Typography className={classes.title} color="textPrimary" gutterBottom>
                        {props.data.name ? props.data.name : 'Ukendt vejnavn'}
                    </Typography>
                    <Typography className={classes.title} color="textSecondary" gutterBottom>
                        Fyldningsgrad: {props.data.fyldningsgrad}
                    </Typography>
                </CardContent>
                <CardActions>
                    <IconButton style={{marginLeft: 'auto'}} onClick={() => navigate(JSON.parse(props.data.location)[1], JSON.parse(props.data.location)[0])} size="small"><DirectionsIcon /></IconButton>
                </CardActions>
            </Card>
        </div>
    );
}

function navigate(lat, lng) {
    // If it's an iPhone..
    if ((navigator.platform.indexOf("iPhone") !== -1) || (navigator.platform.indexOf("iPod") !== -1)) {
        function iOSversion() {
            if (/iP(hone|od|ad)/.test(navigator.platform)) {
                // supports iOS 2.0 and later
                var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
                return [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
            }
        }
        var ver = iOSversion() || [0];

        var protocol = 'http://';
        if (ver[0] >= 6) {
            protocol = 'maps://';
        }
        window.location = protocol + 'maps.apple.com/maps?daddr=' + lat + ',' + lng + '&amp;ll=';
    }
    else {
        window.open('http://maps.google.com?daddr=' + lat + ',' + lng + '&amp;ll=');
    }
}