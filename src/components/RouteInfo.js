import React from 'react'

const RouteInfo = (props) => {
    return (
        <div className='route-info'>
            <table>
                <tbody>
                    <tr>
                        <td>Længde</td>
                        <td>{props.distance} km</td>
                    </tr>
                    <tr>
                        <td>Tid</td>
                        <td>{props.duration}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default RouteInfo
