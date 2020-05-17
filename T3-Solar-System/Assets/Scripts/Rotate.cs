using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Rotate : MonoBehaviour
{
    [Tooltip("Center of rotation")]
    public Transform center;
    [Tooltip("Degrees per second")]
    public float speed=90;
    [Tooltip("Distance from center of rotation")]
    public float displacement = 10;
    [Tooltip("Should calculate displacement based on starting positions or not")]
    public bool calculateDisplacement = true;
    [Header("Local Rotation")]
    public bool enable = false;
    [Tooltip("Degrees per second")]
    public float rotationSpeed = 360f;
    void Start()
    {
        if( calculateDisplacement)
        {
            displacement = (transform.position - center.position).magnitude;
        }
    }
    // Wait for a bit for update...
    void LateUpdate()
    {
        transform.position = center.position + (transform.position - center.position).normalized * displacement;
        transform.RotateAround(center.position, center.up, (speed*Time.deltaTime));
        if (enable)
        {
            transform.Rotate(transform.up, Time.deltaTime * rotationSpeed);
        }
    }
}
