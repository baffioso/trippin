import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import IconButton from '@material-ui/core/IconButton';
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
    
    let location;
    if (typeof props.data.location === "string") {
        location = JSON.parse(props.data.location)
    } else {
        location = props.data.location
    }

    let lat = location[1]
    let lng = location[0]

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
                    <IconButton style={{marginLeft: 'auto'}} onClick={() => window.open(`http://maps.google.com?daddr=${lat},${lng}&amp;ll=`)} size="small"><DirectionsIcon /></IconButton>
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