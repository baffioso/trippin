import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import { Fab } from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import DeleteIcon from '@material-ui/icons/Delete';
import ListIcon from '@material-ui/icons/List';

const useStyles = makeStyles({
    list: {
        width: 250
    },
    btn: {
        position: "fixed",
        bottom: 80,
        right: 10,
        zIndex: 100,
        backgroundColor: 'rgb(37, 167, 167)'
    }
});

export default function WaypointList(props) {
    const classes = useStyles();
    const [state, setState] = React.useState({
        top: false,
        left: false,
        bottom: false,
        right: false,
    });

    

    const toggleDrawer = (side, open) => event => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }

        setState({ ...state, [side]: open });
    };

    const sideList = side => (
        <div
            className={classes.list}
            role="presentation"
            onClick={toggleDrawer(side, false)}
            onKeyDown={toggleDrawer(side, false)}
        >
            <List>
                {props.waypoints.sort((a, b) => (a.index > b.index) ? 1 : -1).map(item => (
                    <ListItem button key={item.index} test='hello' onClick={() => props.clicked(item.location)} >
                        <ListItemIcon>
                            <DeleteIcon />
                        </ListItemIcon>
                        <ListItemText primary={item.name ? `${item.index}. ${item.name}` : `${item.index}. Ukendt vejnavn`} />
                    </ListItem>
                ))}
            </List>
        </div>
    );

    return (
        <div>
            <Fab className={classes.btn} color="primary" aria-label="add" onClick={toggleDrawer('right', true)}>
                <ListIcon fontSize='large' />
            </Fab>

            <Drawer anchor="right" open={state.right} onClose={toggleDrawer('right', false)}>
                {sideList('right')}
            </Drawer>
        </div>
    );
}
